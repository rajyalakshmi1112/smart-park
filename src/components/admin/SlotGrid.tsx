import React, { useState } from 'react';
import { ParkingSlot, ParkingFacility, Booking } from '../../types';
import { storageService } from '../../services/storage';
import { X, Car, Clock, ShieldCheck, RefreshCw, User } from 'lucide-react';

interface SlotGridProps {
  slots: ParkingSlot[];
  facilities: ParkingFacility[];
  bookings: Booking[];
  selectedFacilityId?: string;
}

export const SlotGrid: React.FC<SlotGridProps> = ({
  slots,
  facilities,
  bookings,
  selectedFacilityId: externalFacilityId
}) => {
  const [internalFacilityId, setInternalFacilityId] = useState<string>(
    facilities[0]?.id || 'fac-cmr-maddilapalem'
  );
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);

  const selectedFacilityId = externalFacilityId && externalFacilityId !== 'ALL'
    ? externalFacilityId
    : (facilities[0]?.id || 'fac-cmr-maddilapalem');

  const facilitySlots = slots.filter((s) => s.facilityId === selectedFacilityId);
  const facility = facilities.find((f) => f.id === selectedFacilityId);

  // Link selected slot to booking if applicable
  const activeBooking = selectedSlot?.currentBookingId
    ? bookings.find((b) => b.id === selectedSlot.currentBookingId)
    : undefined;



  const handleManualRelease = () => {
    if (!selectedSlot) return;
    const updated: ParkingSlot = {
      ...selectedSlot,
      state: 'AVAILABLE',
      currentBookingId: undefined,
      currentVehicleNumber: undefined,
      occupiedAt: undefined
    };
    storageService.updateSlot(updated);
    setSelectedSlot(updated);
  };

  const getSlotColor = (state: ParkingSlot['state']) => {
    switch (state) {
      case 'AVAILABLE':
        return 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600';
      case 'RESERVED':
        return 'bg-amber-400 hover:bg-amber-500 text-amber-950 border-amber-500 font-bold';
      case 'OCCUPIED':
        return 'bg-rose-500 hover:bg-rose-600 text-white border-rose-600';
      default:
        return 'bg-slate-200 text-slate-700';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      {/* Top Header with Facility Filter & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Real-Time Bay Layout & Visual Slot Grid
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any individual parking bay to inspect booking link, vehicle, or manual override.
          </p>
        </div>

        {/* Active Facility Badge & Clear Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const count = storageService.clearFilledAndReservedSlots(selectedFacilityId);
              if (selectedSlot && (selectedSlot.state === 'OCCUPIED' || selectedSlot.state === 'RESERVED')) {
                setSelectedSlot({
                  ...selectedSlot,
                  state: 'AVAILABLE',
                  currentBookingId: undefined,
                  currentVehicleNumber: undefined,
                  occupiedAt: undefined
                });
              }
            }}
            className="text-xs font-semibold px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Clear all occupied & reserved bays in this facility"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Clear Filled Bays</span>
          </button>

          <div className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg">
            {facility?.name || 'Selected Facility'}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-emerald-500 border border-emerald-600 inline-block" />
          <span>AVAILABLE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-amber-400 border border-amber-500 inline-block" />
          <span>RESERVED</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-rose-500 border border-rose-600 inline-block" />
          <span>OCCUPIED</span>
        </div>
      </div>

      {/* Interactive Slot Grid (A-01 to A-50) */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2 w-full">
        {facilitySlots.map((slot) => {
          const isSelected = selectedSlot?.id === slot.id;
          return (
            <button
              key={slot.id}
              onClick={() => setSelectedSlot(slot)}
              className={`h-11 sm:h-12 rounded-lg border text-[11px] sm:text-xs font-mono font-bold transition-transform active:scale-95 flex flex-col items-center justify-center p-1 shadow-xs ${getSlotColor(
                slot.state
              )} ${isSelected ? 'ring-3 ring-slate-900 ring-offset-2' : ''}`}
              title={`Slot ${slot.slotNumber} · ${slot.state}`}
            >
              <span>{slot.slotNumber}</span>
              <span className="text-[9px] font-sans font-normal opacity-90 truncate max-w-full">
                {slot.state === 'AVAILABLE' ? 'Free' : slot.state === 'RESERVED' ? 'Held' : slot.state === 'OCCUPIED' ? 'Parked' : 'Maint'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Slot Inspector Panel (Section 16 requirement) */}
      {selectedSlot && (
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-slate-900 font-mono">
                BAY INSPECTION: {selectedSlot.slotNumber}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded font-mono ${
                  selectedSlot.state === 'AVAILABLE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedSlot.state === 'RESERVED'
                      ? 'bg-amber-100 text-amber-800'
                      : selectedSlot.state === 'OCCUPIED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-200 text-slate-800'
                }`}
              >
                {selectedSlot.state}
              </span>
            </div>

            <button
              onClick={() => setSelectedSlot(null)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 font-sans block text-[11px]">Facility</span>
              <span className="font-bold text-slate-800 font-sans">{facility?.name}</span>
            </div>

            <div>
              <span className="text-slate-500 font-sans block text-[11px]">Current Booking</span>
              <span className="font-bold text-slate-800">
                {selectedSlot.currentBookingId || activeBooking?.id || 'None'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-sans block text-[11px]">Vehicle Number</span>
              <span className="font-bold text-slate-800">
                {selectedSlot.currentVehicleNumber || activeBooking?.vehicleNumber || '—'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-sans block text-[11px]">Entry / Expected Exit</span>
              <span className="font-bold text-slate-800">
                {activeBooking
                  ? `${activeBooking.entryTime} → ${activeBooking.exitExpectedTime}`
                  : selectedSlot.occupiedAt
                    ? `${selectedSlot.occupiedAt} (Checked-In)`
                    : '—'}
              </span>
            </div>
          </div>

          {/* Admin manual controls */}
          {selectedSlot.state !== 'AVAILABLE' && (
            <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-200 text-xs">
              <button
                onClick={handleManualRelease}
                className="py-1.5 px-3 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 flex items-center gap-1.5 transition-colors font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Manual Override: Release to Available</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
