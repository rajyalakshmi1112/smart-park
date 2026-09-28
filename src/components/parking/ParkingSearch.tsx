import React, { useState } from 'react';
import { Search, Calendar, Clock, Car, Filter, MapPin, Map, Grid, X, AlertCircle } from 'lucide-react';
import { ParkingFacility, ParkingSlot, VehicleType } from '../../types';
import { ParkingCard } from './ParkingCard';
import { ParkingDetailsModal } from './ParkingDetailsModal';
import { ParkingMap } from './ParkingMap';
import { getTodayDateString, getMaxDateString } from '../../data/mockSeed';

interface ParkingSearchProps {
  facilities: ParkingFacility[];
  slots: ParkingSlot[];
  onSelectFacilityForBooking: (
    facility: ParkingFacility,
    searchParams: { date: string; entryTime: string; duration: number; vehicleType: VehicleType }
  ) => void;
}

class MapErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.warn('Map rendering recovered:', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-500 shadow-sm">
          Interactive map preview temporarily reset. All 5 prototype facilities are available in the list below.
        </div>
      );
    }
    return this.props.children;
  }
}

export const ParkingSearch: React.FC<ParkingSearchProps> = ({
  facilities,
  slots,
  onSelectFacilityForBooking
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());
  const [selectedTime, setSelectedTime] = useState('06:00 PM');
  const [selectedDuration, setSelectedDuration] = useState(2);
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType>('Car');
  const [inspectingFacility, setInspectingFacility] = useState<ParkingFacility | null>(null);
  const [showMap, setShowMap] = useState(true);

  // Robust Search Matcher (Section 1 requirement)
  const filteredFacilities = facilities.filter((f) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    const inName = f.name.toLowerCase().includes(q);
    const inArea = f.area.toLowerCase().includes(q);
    const inDesc = f.description.toLowerCase().includes(q);
    const inKeywords = f.keywords?.some((k) => k.toLowerCase().includes(q) || q.includes(k.toLowerCase()));

    return inName || inArea || inDesc || inKeywords;
  });


  const handleBookingStart = (facility: ParkingFacility) => {
    onSelectFacilityForBooking(facility, {
      date: selectedDate,
      entryTime: selectedTime,
      duration: selectedDuration,
      vehicleType: selectedVehicleType
    });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header (Section 4 & 19: Clear visual hierarchy, no misleading live claims) */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>Visakhapatnam Prototype Locations</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Check parking availability across prototype Vizag parking facilities and reserve your space before you arrive.
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
          Simulated occupancy, guaranteed reservations, and automated QR gate verification across prototype infrastructure.
        </p>
      </div>

      {/* Filter Bar (Section 19: Location / Area, Date, Entry Time, Duration, Vehicle Type) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Location Search Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Location / Area</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. CMR Maddilapalem, Gajuwaka, Inorbit..."
                className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  title="Clear search query"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Date Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Date</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="date"
                value={selectedDate}
                min={getTodayDateString()}
                max={getMaxDateString()}
                onChange={(e) => {
                  let val = e.target.value;
                  if (val) {
                    const parts = val.split('-');
                    if (parts[0] && parts[0].length > 4) {
                      parts[0] = parts[0].slice(0, 4);
                      val = parts.join('-');
                    }
                  }
                  setSelectedDate(val);
                }}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white font-mono"
              />
            </div>
          </div>

          {/* Entry Time */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Entry Time</label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              >
                <option value="08:00 AM">08:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="06:00 PM">06:00 PM</option>
                <option value="07:30 PM">07:30 PM</option>
                <option value="09:00 PM">09:00 PM</option>
              </select>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Duration</label>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            >
              <option value={1}>1 Hour</option>
              <option value={2}>2 Hours</option>
              <option value={3}>3 Hours</option>
              <option value={4}>4 Hours</option>
              <option value={8}>8 Hours (Full Day)</option>
            </select>
          </div>

          {/* Vehicle Type */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Vehicle Type</label>
            <div className="relative">
              <Car className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <select
                value={selectedVehicleType}
                onChange={(e) => setSelectedVehicleType(e.target.value as VehicleType)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white font-medium"
              >
                <option value="Car">Car (₹30/hr)</option>
                <option value="Motorcycle">Motorcycle (₹20/hr)</option>
              </select>
            </div>
          </div>
        </div>
      </div>


      {/* Controls & Map View Toggle Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div>
          Showing <strong>{filteredFacilities.length}</strong> of <strong>{facilities.length}</strong> prototype parking locations in Visakhapatnam
          {searchQuery && (
            <span className="ml-1 text-slate-500">
              for &quot;<strong>{searchQuery}</strong>&quot;
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMap(!showMap)}
            className="py-1.5 px-3 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Map className="w-3.5 h-3.5 text-emerald-600" />
            <span>{showMap ? 'Hide Interactive Map' : 'Show Interactive Map'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Map (Section 20 requirement) */}
      {showMap && (
        <MapErrorBoundary>
          <ParkingMap
            facilities={filteredFacilities.length > 0 ? filteredFacilities : facilities}
            slots={slots}
            onSelectFacility={handleBookingStart}
            onOpenDetails={(f) => setInspectingFacility(f)}
          />
        </MapErrorBoundary>
      )}

      {/* Facilities Cards or Professional Empty State (Section 1 & 6) */}
      {filteredFacilities.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              No prototype parking locations match &apos;{searchQuery}&apos;.
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              We couldn&apos;t find a prototype parking facility matching your search term. Try searching for &quot;CMR Maddilapalem&quot;, &quot;CMR Gajuwaka&quot;, or &quot;Inorbit Mall&quot;.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
            >
              Clear Search
            </button>
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              View All Parking
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacilities.map((facility) => (
            <ParkingCard
              key={facility.id}
              facility={facility}
              slots={slots}
              selectedVehicleType={selectedVehicleType}
              onSelectFacility={handleBookingStart}
              onOpenDetails={(f) => setInspectingFacility(f)}
            />
          ))}
        </div>
      )}

      {/* Facility Specs Modal */}
      <ParkingDetailsModal
        facility={inspectingFacility}
        slots={slots}
        selectedVehicleType={selectedVehicleType}
        isOpen={!!inspectingFacility}
        onClose={() => setInspectingFacility(null)}
        onProceedToBooking={handleBookingStart}
      />
    </div>
  );
};
