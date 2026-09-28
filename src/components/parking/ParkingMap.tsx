import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ParkingFacility, ParkingSlot } from '../../types';
import { Navigation } from 'lucide-react';

interface ParkingMapProps {
  facilities: ParkingFacility[];
  slots: ParkingSlot[];
  selectedFacilityId?: string;
  onSelectFacility: (facility: ParkingFacility) => void;
  onOpenDetails: (facility: ParkingFacility) => void;
}

// Default fallback coordinates lookup table for Visakhapatnam prototype facilities
const DEFAULT_COORDS_MAP: Record<string, [number, number]> = {
  'fac-cmr-maddilapalem': [17.7385, 83.3195],
  'fac-cmr-gajuwaka': [17.6900, 83.2185],
  'fac-inorbit': [17.7180, 83.2790]
};

const VIZAG_CENTER: [number, number] = [17.72, 83.28];

// Module-level guard to ensure Leaflet never throws "Invalid LatLng object: (undefined, undefined)"
if (typeof window !== 'undefined' && L) {
  try {
    const OriginalLatLng = L.LatLng;
    // @ts-ignore
    L.LatLng = function (lat: any, lng: any, alt?: any) {
      const validLat = Number.isFinite(Number(lat)) ? Number(lat) : VIZAG_CENTER[0];
      const validLng = Number.isFinite(Number(lng)) ? Number(lng) : VIZAG_CENTER[1];
      return new (OriginalLatLng as any)(validLat, validLng, alt);
    };
    L.LatLng.prototype = OriginalLatLng.prototype;

    const originalToLatLng = L.latLng;
    // @ts-ignore
    L.latLng = function (a: any, b?: any, c?: any) {
      if (a === undefined || a === null) {
        return originalToLatLng(VIZAG_CENTER[0], VIZAG_CENTER[1]);
      }
      if (Array.isArray(a)) {
        const lat = Number(a[0]);
        const lng = Number(a[1]);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          return originalToLatLng(VIZAG_CENTER[0], VIZAG_CENTER[1]);
        }
      } else if (typeof a === 'object') {
        const lat = Number(a.lat);
        const lng = Number(a.lng ?? a.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          return originalToLatLng(VIZAG_CENTER[0], VIZAG_CENTER[1]);
        }
      } else if (b !== undefined) {
        const lat = Number(a);
        const lng = Number(b);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          return originalToLatLng(VIZAG_CENTER[0], VIZAG_CENTER[1]);
        }
      }
      try {
        return originalToLatLng(a, b, c);
      } catch {
        return originalToLatLng(VIZAG_CENTER[0], VIZAG_CENTER[1]);
      }
    };
  } catch (patchErr) {
    console.warn('Leaflet safety patch warning:', patchErr);
  }
}

export const ParkingMap: React.FC<ParkingMapProps> = ({
  facilities,
  slots,
  selectedFacilityId,
  onSelectFacility,
  onOpenDetails
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  // Initialize Leaflet Map instance once on mount
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Clean up any stale Leaflet internal ID if container was reused
    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    let map: L.Map | null = null;
    try {
      map = L.map(container, {
        center: VIZAG_CENTER,
        zoom: 12,
        scrollWheelZoom: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 10
      }).addTo(map);

      // Create a layer group to hold all facility markers dynamically
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    } catch (err) {
      console.error('Failed to initialize Leaflet map:', err);
      return;
    }

    // Invalidate map size after layout settling
    const resizeTimer = setTimeout(() => {
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      } catch {
        // ignore layout race
      }
    }, 300);

    return () => {
      clearTimeout(resizeTimer);
      if (map) {
        try {
          map.remove();
        } catch (err) {
          console.warn('Error during map cleanup:', err);
        }
      }
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
      markersRef.current = {};
    };
  }, []);

  // Sync Markers when facilities, slots, or selectedFacilityId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    markersRef.current = {};

    const createCustomIcon = (name: string, isAvailable: boolean, isSelected: boolean) => {
      const bgColor = isSelected ? '#0f172a' : isAvailable ? '#059669' : '#dc2626';
      const label = (name || 'Parking').split(' ')[0];

      return L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            background: ${bgColor};
            color: #ffffff;
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 700;
            font-family: system-ui, -apple-system, sans-serif;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 2px solid #ffffff;
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
            cursor: pointer;
            transform: translate(-50%, -100%);
          ">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #ffffff;"></span>
            <span>${label}</span>
          </div>
        `,
        iconSize: [80, 30],
        iconAnchor: [40, 20]
      });
    };

    (facilities || []).forEach((fac) => {
      if (!fac || !fac.id) return;

      const fallback = DEFAULT_COORDS_MAP[fac.id] || VIZAG_CENTER;
      const rawLat = fac.lat != null ? Number(fac.lat) : fallback[0];
      const rawLng = fac.lng != null ? Number(fac.lng) : fallback[1];

      const lat = Number.isFinite(rawLat) ? rawLat : fallback[0];
      const lng = Number.isFinite(rawLng) ? rawLng : fallback[1];

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      try {
        const facSlots = (slots || []).filter((s) => s.facilityId === fac.id);
        const total = facSlots.length || fac.totalCapacity || 50;
        const available = facSlots.filter((s) => s.state === 'AVAILABLE').length;
        const isAvailable = available > 0;
        const isSelected = selectedFacilityId === fac.id;

        const marker = L.marker([lat, lng], {
          icon: createCustomIcon(fac.name || 'Prototype Parking', isAvailable, isSelected)
        });

        const popupHtml = `
          <div style="font-family: system-ui, sans-serif; min-width: 200px; padding: 4px;">
            <div style="font-size: 10px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 0.5px;">Prototype Facility</div>
            <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">${fac.name}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${fac.area || 'Visakhapatnam'}</div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 6px; border-top: 1px solid #e2e8f0; font-size: 11px;">
              <span style="color: ${isAvailable ? '#059669' : '#dc2626'}; font-weight: 600;">
                ${available} / ${total} Available
              </span>
              <span style="font-weight: 700; color: #0f172a;">₹${fac.pricePerHour || 30}/hr</span>
            </div>

            <div style="display: flex; gap: 6px; margin-top: 8px;">
              <button id="btn-reserve-${fac.id}" style="
                flex: 1;
                background: #059669;
                color: white;
                border: none;
                padding: 6px 10px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
              ">
                Reserve
              </button>
              <button id="btn-details-${fac.id}" style="
                background: #f1f5f9;
                color: #334155;
                border: 1px solid #cbd5e1;
                padding: 6px 8px;
                border-radius: 6px;
                font-size: 11px;
                cursor: pointer;
              ">
                Details
              </button>
            </div>
          </div>
        `;

        marker.bindPopup(popupHtml);

        marker.on('popupopen', () => {
          const btnReserve = document.getElementById(`btn-reserve-${fac.id}`);
          const btnDetails = document.getElementById(`btn-details-${fac.id}`);

          if (btnReserve) {
            btnReserve.onclick = () => onSelectFacility(fac);
          }
          if (btnDetails) {
            btnDetails.onclick = () => onOpenDetails(fac);
          }
        });

        marker.addTo(markersLayer);
        markersRef.current[fac.id] = marker;
      } catch (markerErr) {
        console.warn(`Failed to create marker for facility ${fac.id}:`, markerErr);
      }
    });
  }, [facilities, slots, selectedFacilityId, onSelectFacility, onOpenDetails]);

  // Center on selected facility if specified
  useEffect(() => {
    if (selectedFacilityId && mapInstanceRef.current) {
      const fac = facilities.find((f) => f.id === selectedFacilityId);
      if (fac) {
        const fallback = DEFAULT_COORDS_MAP[fac.id] || VIZAG_CENTER;
        const rawLat = fac.lat != null ? Number(fac.lat) : fallback[0];
        const rawLng = fac.lng != null ? Number(fac.lng) : fallback[1];
        const lat = Number.isFinite(rawLat) ? rawLat : fallback[0];
        const lng = Number.isFinite(rawLng) ? rawLng : fallback[1];

        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          try {
            mapInstanceRef.current.setView([lat, lng], 14, { animate: true });
            markersRef.current[fac.id]?.openPopup();
          } catch (err) {
            console.warn('Error centering map on facility:', err);
          }
        }
      }
    }
  }, [selectedFacilityId, facilities]);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-2 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Visakhapatnam Prototype Parking Map
          </h3>
        </div>
        <div className="text-[11px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded">
          Prototype map — simulated parking locations
        </div>
      </div>

      {/* Map Viewport Container */}
      <div className="relative w-full h-72 sm:h-80 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 z-0">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 px-1 pt-1">
        <span>Click any pin to view simulated bay occupancy and jump straight to reservation.</span>
        <span className="text-[11px] text-amber-700">Does not claim integration with real municipal sensors.</span>
      </div>
    </div>
  );
};
