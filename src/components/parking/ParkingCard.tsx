import React from 'react';
import { MapPin, Clock, IndianRupee, ShieldCheck, Car, Sparkles, ChevronRight, Check } from 'lucide-react';
import { ParkingFacility, ParkingSlot, VehicleType } from '../../types';

interface ParkingCardProps {
  facility: ParkingFacility;
  slots: ParkingSlot[];
  selectedVehicleType: VehicleType;
  onSelectFacility: (facility: ParkingFacility) => void;
  onOpenDetails: (facility: ParkingFacility) => void;
}

export const ParkingCard: React.FC<ParkingCardProps> = ({
  facility,
  slots,
  selectedVehicleType,
  onSelectFacility,
  onOpenDetails
}) => {
  const facilitySlots = slots.filter((s) => s.facilityId === facility.id);
  const totalSlots = facilitySlots.length || facility.totalCapacity;
  const availableSlots = facilitySlots.filter((s) => s.state === 'AVAILABLE').length;
  const occupiedSlots = facilitySlots.filter((s) => s.state === 'OCCUPIED').length;
  const reservedSlots = facilitySlots.filter((s) => s.state === 'RESERVED').length;

  const occupancyRatio = (totalSlots - availableSlots) / totalSlots;
  const isNearlyFull = availableSlots <= 5;
  const isAvailable = availableSlots > 0;

  // Rate calculation: Motorcycle ₹20/hr, Car ₹30/hr
  const price = selectedVehicleType === 'Motorcycle' ? 20 : 30;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
      {/* Top Image & Status Header */}
      <div>
        <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
          <img
            src={facility.imagePath}
            alt={facility.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          
          {/* Fallback styling */}
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-700 p-4 flex flex-col justify-between -z-10">
            <span className="text-[11px] font-mono text-emerald-400">PROTOTYPE FACILITY</span>
            <span className="text-white font-bold">{facility.name}</span>
          </div>

          {/* Prototype configuration marker */}
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-mono px-2.5 py-1 rounded shadow">
            Prototype Configuration
          </div>

          {/* Availability pill */}
          <div className="absolute top-3 right-3">
            {isAvailable ? (
              <span className={`px-2.5 py-1 rounded text-xs font-semibold shadow flex items-center gap-1.5 ${
                isNearlyFull ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-600 text-white'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {availableSlots} Spaces Free
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded text-xs font-semibold bg-rose-600 text-white shadow">
                Facility Full
              </span>
            )}
          </div>

          {/* Bottom scrim with area info */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-3 text-white">
            <div className="flex items-center gap-1.5 text-xs">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{facility.area}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300 truncate">{facility.distance}</span>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-5 space-y-4">
          <div>
            <div className="text-[11px] font-mono font-semibold text-emerald-700 uppercase tracking-wider">
              Prototype Facility
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              {facility.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {facility.description}
            </p>
          </div>

          {/* Prototype Capacity Meter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">
                {availableSlots} / {totalSlots} spaces available
              </span>
              <span className="font-semibold text-slate-700 font-mono-numbers text-[11px]">
                {Math.round(((totalSlots - availableSlots) / totalSlots) * 100)}% occupied
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
              <div
                className="bg-rose-500 h-full transition-all duration-300"
                style={{ width: `${(occupiedSlots / totalSlots) * 100}%` }}
                title={`Occupied: ${occupiedSlots}`}
              />
              <div
                className="bg-amber-400 h-full transition-all duration-300"
                style={{ width: `${(reservedSlots / totalSlots) * 100}%` }}
                title={`Reserved: ${reservedSlots}`}
              />
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${(availableSlots / totalSlots) * 100}%` }}
                title={`Available: ${availableSlots}`}
              />
            </div>
          </div>

          {/* Attributes */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">Open {facility.operatingHours}</span>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <span className="font-bold text-slate-900 flex items-center font-mono-numbers">
                ₹{price} / hour
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-5 pb-5 pt-2 flex items-center gap-2 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={() => onOpenDetails(facility)}
          className="flex-1 py-2 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-center"
        >
          Facility Specs
        </button>

        <button
          onClick={() => onSelectFacility(facility)}
          disabled={!isAvailable}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm ${
            isAvailable
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>{isAvailable ? 'Reserve Parking' : 'No Slots Available'}</span>
          {isAvailable && <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
