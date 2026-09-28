import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Grid3X3, 
  Table, 
  Activity, 
  BarChart2, 
  Search, 
  Filter, 
  Car, 
  CheckCircle2, 
  AlertTriangle, 
  LogOut, 
  QrCode, 
  RotateCcw,
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import { Booking, ParkingFacility, ParkingSlot, GateEvent } from '../../types';
import { SlotGrid } from './SlotGrid';
import { AnalyticsView } from './AnalyticsView';
import { storageService } from '../../services/storage';
import { markBookingNoShow, executeGateExit } from '../../services/gateValidation';

interface AdminDashboardProps {
  facilities: ParkingFacility[];
  slots: ParkingSlot[];
  bookings: Booking[];
  gateEvents: GateEvent[];
  onInspectTicket: (bookingId: string) => void;
  onOpenDemoControls: () => void;
  onShowNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  facilities,
  slots,
  bookings,
  gateEvents,
  onInspectTicket,
  onOpenDemoControls,
  onShowNotification
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'slots' | 'bookings' | 'activity' | 'analytics'>('overview');

  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('ALL');

  // Bookings filter & search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | Booking['status']>('ALL');
  const [gateEventTypeFilter, setGateEventTypeFilter] = useState<'ALL' | GateEvent['type']>('ALL');

  // Filter slots, bookings, and events by selected facility if filtered
  const activeSlots = selectedFacilityId === 'ALL'
    ? slots
    : slots.filter((s) => s.facilityId === selectedFacilityId);

  const activeBookingsList = selectedFacilityId === 'ALL'
    ? bookings
    : bookings.filter((b) => b.facilityId === selectedFacilityId);

  const activeGateEvents = selectedFacilityId === 'ALL'
    ? gateEvents
    : gateEvents.filter((e) => e.facilityId === selectedFacilityId);

  // Compute live dashboard metrics
  const totalCapacity = activeSlots.length;
  const availableSlots = activeSlots.filter((s) => s.state === 'AVAILABLE').length;
  const reservedSlots = activeSlots.filter((s) => s.state === 'RESERVED').length;
  const occupiedSlots = activeSlots.filter((s) => s.state === 'OCCUPIED').length;

  // Bookings metrics
  const todaysBookingsCount = activeBookingsList.length;
  const entriesCount = activeGateEvents.filter((e) => e.type === 'ENTRY_ALLOWED').length;
  const exitsCount = activeGateEvents.filter((e) => e.type === 'EXIT_COMPLETED').length;
  const noShowsCount = activeBookingsList.filter((b) => b.status === 'NO_SHOW').length;

  // Filtered Bookings Table
  const filteredBookings = bookings.filter((b) => {
    const matchesFacility = selectedFacilityId === 'ALL' || b.facilityId === selectedFacilityId;
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      b.id.toLowerCase().includes(q) ||
      b.vehicleNumber.toLowerCase().includes(q) ||
      b.slotNumber.toLowerCase().includes(q) ||
      b.facilityName.toLowerCase().includes(q);

    return matchesFacility && matchesStatus && matchesSearch;
  });

  const handleMarkNoShow = (bookingId: string) => {
    const res = markBookingNoShow(bookingId);
    if (res.success) {
      onShowNotification(`Booking ${bookingId} marked as No-Show. Slot released.`, 'info');
    } else {
      onShowNotification(res.error || 'Failed to update booking', 'error');
    }
  };

  const handleMarkExit = (bookingId: string) => {
    const res = executeGateExit(bookingId);
    if (res.success) {
      onShowNotification(`Booking ${bookingId} checked out. Slot released to AVAILABLE.`, 'success');
    } else {
      onShowNotification(res.error || 'Failed to exit', 'error');
    }
  };

  const handleClearAllFilledSlots = () => {
    const clearedCount = storageService.clearFilledAndReservedSlots(selectedFacilityId);
    const scopeName = selectedFacilityId === 'ALL' ? 'all facilities' : facilities.find(f => f.id === selectedFacilityId)?.name || 'selected facility';
    onShowNotification(`Cleared ${clearedCount} occupied & reserved bays across ${scopeName}. All slots are now AVAILABLE.`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 bg-slate-100 px-3 py-1 rounded-full mb-2">
            <span>Visakhapatnam Smart Mobility Prototype</span>
            <span aria-hidden="true">·</span>
            <span>Central Management Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            SmartPark Vizag Admin
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time bay occupancy, optical barrier audit trail, and automated slot allocation management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Facility Filter Dropdown (Moved to Top Right Corner) */}
          <div className="relative">
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="text-xs font-semibold py-2 pl-3 pr-8 border-2 border-emerald-500 rounded-xl bg-white text-slate-900 shadow-sm focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none"
            >
              <option value="ALL">All Facilities (Combined)</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-emerald-600 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          <button
            onClick={handleClearAllFilledSlots}
            className="py-2 px-3 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            title="Release all filled and reserved parking bays back to AVAILABLE"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
            <span>Clear Filled/Reserved Slots</span>
          </button>

          <button
            onClick={onOpenDemoControls}
            className="py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
            <span>Simulate Events</span>
          </button>
        </div>
      </div>

      {/* METRICS CARDS (Interactive Quick Filters) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Total Capacity */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('slots');
          }}
          className="bg-white hover:bg-slate-50 rounded-xl p-3.5 border border-slate-200 hover:border-slate-400 shadow-xs hover:shadow-sm transition-all text-left space-y-1 group focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
          title="Click to view full parking slot map"
        >
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>Total Capacity</span>
            <span className="text-[9px] text-slate-400 group-hover:text-slate-700 transition-colors">View →</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono-numbers">{totalCapacity}</div>
          <div className="text-[10px] text-slate-400">All bays</div>
        </button>

        {/* Available */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('slots');
          }}
          className="bg-white hover:bg-emerald-50/50 rounded-xl p-3.5 border border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-sm transition-all text-left space-y-1 group focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
          title="Click to view free bays on the slot grid"
        >
          <div className="text-[11px] text-emerald-700 font-medium flex items-center justify-between">
            <span>Available Slots</span>
            <span className="text-[9px] text-emerald-600 group-hover:translate-x-0.5 transition-transform">Map →</span>
          </div>
          <div className="text-xl font-extrabold text-emerald-600 font-mono-numbers">{availableSlots}</div>
          <div className="text-[10px] text-emerald-600 font-medium">Ready to reserve</div>
        </button>

        {/* Reserved */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('bookings');
            setStatusFilter('CONFIRMED');
          }}
          className={`rounded-xl p-3.5 border shadow-xs hover:shadow-sm transition-all text-left space-y-1 group focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer ${
            activeTab === 'bookings' && statusFilter === 'CONFIRMED'
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300'
              : 'bg-white hover:bg-amber-50/40 border-slate-200 hover:border-amber-400'
          }`}
          title="Click to filter bookings table by CONFIRMED (Reserved)"
        >
          <div className="text-[11px] text-amber-700 font-medium flex items-center justify-between">
            <span>Reserved Slots</span>
            <span className="text-[9px] text-amber-600 group-hover:translate-x-0.5 transition-transform">Table →</span>
          </div>
          <div className="text-xl font-extrabold text-amber-600 font-mono-numbers">{reservedSlots}</div>
          <div className="text-[10px] text-amber-600 font-medium">Pre-booked bays</div>
        </button>

        {/* Occupied */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('bookings');
            setStatusFilter('CHECKED_IN');
          }}
          className={`rounded-xl p-3.5 border shadow-xs hover:shadow-sm transition-all text-left space-y-1 group focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer ${
            activeTab === 'bookings' && statusFilter === 'CHECKED_IN'
              ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-300'
              : 'bg-white hover:bg-rose-50/40 border-slate-200 hover:border-rose-400'
          }`}
          title="Click to filter bookings table by CHECKED_IN (Occupied)"
        >
          <div className="text-[11px] text-rose-700 font-medium flex items-center justify-between">
            <span>Occupied Slots</span>
            <span className="text-[9px] text-rose-600 group-hover:translate-x-0.5 transition-transform">Table →</span>
          </div>
          <div className="text-xl font-extrabold text-rose-600 font-mono-numbers">{occupiedSlots}</div>
          <div className="text-[10px] text-rose-600 font-medium">Inside bays</div>
        </button>

        {/* Today's Bookings */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('bookings');
            setStatusFilter('ALL');
            setSearchQuery('');
          }}
          className={`rounded-xl p-3.5 border shadow-xs hover:shadow-sm transition-all text-left space-y-1 group focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer ${
            activeTab === 'bookings' && statusFilter === 'ALL'
              ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-300'
              : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-400'
          }`}
          title="Click to view all reservations in the registry"
        >
          <div className="text-[11px] text-slate-700 font-medium flex items-center justify-between">
            <span>Today's Bookings</span>
            <span className="text-[9px] text-slate-600 group-hover:translate-x-0.5 transition-transform">All ({todaysBookingsCount}) →</span>
          </div>
          <div className="text-xl font-extrabold text-slate-800 font-mono-numbers">{todaysBookingsCount}</div>
          <div className="text-[10px] text-slate-400">Total reservations</div>
        </button>

        {/* Today's Entries */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('activity');
            setGateEventTypeFilter('ENTRY_ALLOWED');
          }}
          className={`rounded-xl p-3.5 border shadow-xs hover:shadow-sm transition-all text-left space-y-1 group focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer ${
            activeTab === 'activity' && gateEventTypeFilter === 'ENTRY_ALLOWED'
              ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300'
              : 'bg-white hover:bg-blue-50/40 border-slate-200 hover:border-blue-400'
          }`}
          title="Click to filter activity log by Entry check-ins"
        >
          <div className="text-[11px] text-blue-700 font-medium flex items-center justify-between">
            <span>Today's Entries</span>
            <span className="text-[9px] text-blue-600 group-hover:translate-x-0.5 transition-transform">Logs →</span>
          </div>
          <div className="text-xl font-extrabold text-blue-600 font-mono-numbers">{entriesCount}</div>
          <div className="text-[10px] text-blue-600">Gate check-ins</div>
        </button>

        {/* Today's Exits */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('activity');
            setGateEventTypeFilter('EXIT_COMPLETED');
          }}
          className={`rounded-xl p-3.5 border shadow-xs hover:shadow-sm transition-all text-left space-y-1 group focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer ${
            activeTab === 'activity' && gateEventTypeFilter === 'EXIT_COMPLETED'
              ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-300'
              : 'bg-white hover:bg-purple-50/40 border-slate-200 hover:border-purple-400'
          }`}
          title="Click to filter activity log by Completed Exits"
        >
          <div className="text-[11px] text-purple-700 font-medium flex items-center justify-between">
            <span>Today's Exits</span>
            <span className="text-[9px] text-purple-600 group-hover:translate-x-0.5 transition-transform">Logs →</span>
          </div>
          <div className="text-xl font-extrabold text-purple-600 font-mono-numbers">{exitsCount}</div>
          <div className="text-[10px] text-purple-600">Completed exits</div>
        </button>

        {/* No-Shows */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('bookings');
            setStatusFilter('NO_SHOW');
          }}
          className={`rounded-xl p-3.5 border shadow-xs hover:shadow-sm transition-all text-left space-y-1 group focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer ${
            activeTab === 'bookings' && statusFilter === 'NO_SHOW'
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300'
              : 'bg-white hover:bg-amber-50/40 border-slate-200 hover:border-amber-400'
          }`}
          title="Click to filter bookings table by NO_SHOW"
        >
          <div className="text-[11px] text-amber-800 font-medium flex items-center justify-between">
            <span>No-Shows</span>
            <span className="text-[9px] text-amber-700 group-hover:translate-x-0.5 transition-transform">Table →</span>
          </div>
          <div className="text-xl font-extrabold text-amber-700 font-mono-numbers">{noShowsCount}</div>
          <div className="text-[10px] text-amber-700">Grace expired</div>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit text-xs font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2 px-3.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'overview' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard & Grid</span>
        </button>

        <button
          onClick={() => setActiveTab('slots')}
          className={`py-2 px-3.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'slots' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Grid3X3 className="w-3.5 h-3.5" />
          <span>Parking Map Grid</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`py-2 px-3.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'bookings' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Bookings Registry ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`py-2 px-3.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'activity' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Gate Activity ({gateEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-2 px-3.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Analytics & Telemetry</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW (Slot Grid + Recent Activity Preview) */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <SlotGrid slots={slots} facilities={facilities} bookings={bookings} selectedFacilityId={selectedFacilityId} />

          {/* Quick Split: Recent Gate Activity + Active Bookings */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Gate Activity Feed (Section 18) */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">Recent Gate Activity Log</h3>
                </div>
                <button
                  onClick={() => setActiveTab('activity')}
                  className="text-xs text-emerald-700 hover:underline font-semibold"
                >
                  View All Events →
                </button>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {gateEvents.slice(0, 6).map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-bold">{evt.timestamp}</span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                          evt.type === 'ENTRY_ALLOWED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : evt.type === 'ENTRY_DENIED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {evt.type === 'ENTRY_ALLOWED' && '✓ Entry'}
                        {evt.type === 'ENTRY_DENIED' && '✕ Denied'}
                        {evt.type === 'EXIT_COMPLETED' && '✓ Exit'}
                        {evt.type === 'NO_SHOW_RELEASED' && '↺ No-Show'}
                      </span>
                      <span className="font-bold text-slate-800">{evt.bookingId || '—'}</span>
                    </div>

                    <div className="text-right text-slate-600">
                      {evt.slotNumber && <span className="font-semibold text-emerald-700">Slot {evt.slotNumber}</span>}
                      {evt.reason && <span className="text-[10px] text-slate-500 block truncate max-w-[150px] font-sans">{evt.reason}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Bookings Overview */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Active Facility Reservations</h3>
                </div>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-xs text-blue-700 hover:underline font-semibold"
                >
                  Manage Bookings →
                </button>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {bookings
                  .filter((b) => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN')
                  .slice(0, 5)
                  .map((b) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{b.id}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                              b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {b.vehicleNumber} · Slot {b.slotNumber} · {b.facilityName}
                        </div>
                      </div>

                      <button
                        onClick={() => onInspectTicket(b.id)}
                        className="py-1 px-2.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-medium text-slate-700 transition-colors"
                      >
                        Inspect Ticket
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SLOTS MAP ONLY */}
      {activeTab === 'slots' && (
        <SlotGrid slots={slots} facilities={facilities} bookings={bookings} selectedFacilityId={selectedFacilityId} />
      )}

      {/* TAB 3: BOOKINGS REGISTRY TABLE (Section 17 Requirement) */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          {/* Controls: Search and Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Booking ID, vehicle (AP 31..), or slot (A-27)..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 mr-1">Status:</span>
              {(['ALL', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`py-1 px-2.5 rounded-md transition-colors ${
                    statusFilter === st
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Parking Facility</th>
                  <th className="py-3 px-4">Slot</th>
                  <th className="py-3 px-4">Date & Entry</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono-numbers">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {b.id}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="font-semibold text-slate-800">{b.vehicleNumber}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{b.vehicleType}</div>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-700 max-w-[180px] truncate" title={b.facilityName}>
                      {b.facilityName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono">
                        {b.slotNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600">
                      <div>{b.entryTime}</div>
                      <div className="text-[10px] text-slate-400">{b.date}</div>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600">
                      {b.durationHours} hrs
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'CHECKED_IN'
                              ? 'bg-blue-100 text-blue-800'
                              : b.status === 'COMPLETED'
                                ? 'bg-slate-100 text-slate-700'
                                : b.status === 'NO_SHOW'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-emerald-700 font-medium">
                      ₹{b.estimatedPrice} (Demo)
                    </td>
                    <td className="py-3 px-4 text-right font-sans space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => onInspectTicket(b.id)}
                        className="py-1 px-2 text-[11px] bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-700 transition-colors"
                      >
                        QR Ticket
                      </button>

                      {b.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleMarkNoShow(b.id)}
                          className="py-1 px-2 text-[11px] bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded text-amber-800 transition-colors"
                          title="Simulate grace window lapse"
                        >
                          Lapse No-Show
                        </button>
                      )}

                      {b.status === 'CHECKED_IN' && (
                        <button
                          onClick={() => handleMarkExit(b.id)}
                          className="py-1 px-2 text-[11px] bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded text-blue-800 transition-colors"
                        >
                          Process Exit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: GATE ACTIVITY LOG (Section 18 Requirement) */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Gate Entry & Exit Activity Audit Log
              </h3>
              <p className="text-xs text-slate-500">
                Live stream of optical verification events, barrier actuation, and vehicle checkouts.
              </p>
            </div>

            {/* Gate Event Type Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {(['ALL', 'ENTRY_ALLOWED', 'EXIT_COMPLETED', 'ENTRY_DENIED', 'NO_SHOW_RELEASED'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setGateEventTypeFilter(type)}
                  className={`py-1 px-2.5 rounded-md transition-colors font-medium ${
                    gateEventTypeFilter === type
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type === 'ALL'
                    ? 'All Events'
                    : type === 'ENTRY_ALLOWED'
                      ? 'Entries'
                      : type === 'EXIT_COMPLETED'
                        ? 'Exits'
                        : type === 'ENTRY_DENIED'
                          ? 'Denied'
                          : 'No-Show'}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100 font-mono">
            {gateEvents
              .filter((e) => {
                const matchesFacility = selectedFacilityId === 'ALL' || e.facilityId === selectedFacilityId;
                const matchesType = gateEventTypeFilter === 'ALL' || e.type === gateEventTypeFilter;
                return matchesFacility && matchesType;
              })
              .map((evt) => (
                <div key={evt.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-semibold">{evt.timestamp}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        evt.type === 'ENTRY_ALLOWED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : evt.type === 'ENTRY_DENIED'
                            ? 'bg-rose-100 text-rose-800'
                            : evt.type === 'EXIT_COMPLETED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {evt.type === 'ENTRY_ALLOWED' && '✓ Entry Allowed'}
                      {evt.type === 'ENTRY_DENIED' && '✕ Denied'}
                      {evt.type === 'EXIT_COMPLETED' && '✓ Exit Completed'}
                      {evt.type === 'NO_SHOW_RELEASED' && '↺ No-Show Released'}
                    </span>
                    <span className="font-bold text-slate-900">{evt.bookingId || 'N/A'}</span>
                    {evt.vehicleNumber && <span className="text-slate-600">({evt.vehicleNumber})</span>}
                  </div>

                  <div className="sm:text-right font-sans text-xs">
                    {evt.slotNumber && (
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded mr-2">
                        Slot {evt.slotNumber}
                      </span>
                    )}
                    <span className="text-slate-500 text-[11px]">{evt.reason}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 5: ANALYTICS & TELEMETRY */}
      {activeTab === 'analytics' && (
        <AnalyticsView bookings={bookings} facilities={facilities} slots={slots} />
      )}
    </div>
  );
};
