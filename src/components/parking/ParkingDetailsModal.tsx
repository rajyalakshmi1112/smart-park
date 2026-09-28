import React from 'react';
import { X, MapPin, Clock, IndianRupee, ShieldCheck, Zap, Accessibility, Eye, CheckCircle2, ArrowRight } from 'lucide-react';
import { ParkingFacility, ParkingSlot, VehicleType } from '../../types';

interface ParkingDetailsModalProps {
  facility: ParkingFacility | null;
  slots: ParkingSlot[];
  selectedVehicleType: VehicleType;
  isOpen: boolean;
  onClose: () => void;
  onProceedToBooking: (facility: ParkingFacility) => void;
}

export const ParkingDetailsModal: React.FC<ParkingDetailsModalProps> = ({
  facility,
  slots,
  selectedVehicleType,
  isOpen,
  onClose,
  onProceedToBooking
}) => {
  if (!isOpen || !facility) return null;

  const facilitySlots = slots.filter((s) => s.facilityId === facility.id);
  const totalCapacity = facilitySlots.length || facility.totalCapacity;
  const availableCount = facilitySlots.filter((s) => s.state === 'AVAILABLE').length;
  const reservedCount = facilitySlots.filter((s) => s.state === 'RESERVED').length;
  const occupiedCount = facilitySlots.filter((s) => s.state === 'OCCUPIED').length;

  // Rate calculation: Motorcycle ₹20/hr, Car ₹30/hr
  const price = selectedVehicleType === 'Motorcycle' ? 20 : 30;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="relative h-44 bg-slate-900 overflow-hidden">
          <img
            src={facility.imagePath}
            alt={facility.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-60"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-6 flex flex-col justify-end text-white">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-medium text-emerald-400 uppercase tracking-wider">
                  Prototype Facility Configuration
                </span>
                <h2 className="text-xl sm:text-2xl font-bold">{facility.name}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{facility.area}</span>
                  <span>·</span>
                  <span>{facility.distance}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white p-2 rounded-full border border-white/20 transition-colors self-start"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Availability breakdown visualization (Section 5 example) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Live Capacity Visualization
            </h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs text-slate-500">Total Capacity</div>
                <div className="text-xl font-bold text-slate-900 font-mono-numbers">{totalCapacity}</div>
                <div className="text-[10px] text-slate-400">Total Bays</div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="text-xs text-emerald-700 font-medium">Available</div>
                <div className="text-xl font-bold text-emerald-700 font-mono-numbers">{availableCount}</div>
                <div className="text-[10px] text-emerald-600 font-medium">Ready to reserve</div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="text-xs text-amber-800 font-medium">Reserved</div>
                <div className="text-xl font-bold text-amber-800 font-mono-numbers">{reservedCount}</div>
                <div className="text-[10px] text-amber-700">En route / Pre-booked</div>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <div className="text-xs text-rose-800 font-medium">Occupied</div>
                <div className="text-xl font-bold text-rose-800 font-mono-numbers">{occupiedCount}</div>
                <div className="text-[10px] text-rose-700">Parked in bay</div>
              </div>
            </div>

            {/* Visual ratio bar */}
            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
              <div style={{ width: `${(availableCount / totalCapacity) * 100}%` }} className="bg-emerald-500" title={`Available: ${availableCount}`} />
              <div style={{ width: `${(reservedCount / totalCapacity) * 100}%` }} className="bg-amber-400" title={`Reserved: ${reservedCount}`} />
              <div style={{ width: `${(occupiedCount / totalCapacity) * 100}%` }} className="bg-rose-500" title={`Occupied: ${occupiedCount}`} />
            </div>
          </div>

          {/* Pricing & Operating parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="text-slate-500">Operating Schedule</div>
              <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-600" />
                {facility.operatingHours}
              </div>
              <div className="text-[11px] text-slate-500">Simulated gate operates during these hours</div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="text-slate-500">Standard Parking Tariff</div>
              <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 font-mono-numbers">
                ₹{price} / hour ({selectedVehicleType})
              </div>
              <div className="text-[11px] text-slate-500">Demo billing calculated at reservation</div>
            </div>
          </div>

          {/* Basic facilities prototype list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Facility Features & Infrastructure
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">Prototype Specification</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-700 shrink-0" />
                <span>CCTV — Prototype</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>EV charging — Prototype</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center gap-2">
                <Accessibility className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Accessible parking — Prototype</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Security monitoring — Prototype</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <strong>Prototype Configuration:</strong> The indicated amenities represent simulated parameters for this demonstration and do not reflect physical infrastructure at actual real-world Vizag landmarks.
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose();
              onProceedToBooking(facility);
            }}
            disabled={availableCount === 0}
            className={`px-5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm ${
              availableCount > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>Proceed to Reservation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
