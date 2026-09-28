import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Car, QrCode, ArrowRight, XCircle, CheckCircle2, AlertTriangle, LogOut } from 'lucide-react';
import { Booking } from '../../types';
import { storageService } from '../../services/storage';

interface MyBookingsViewProps {
  bookings: Booking[];
  onSelectBooking: (booking: Booking) => void;
  onNavigateToEntryGate: (bookingId: string) => void;
  onNavigateToExitGate: (bookingId: string) => void;
  onNavigateToSearch: () => void;
  onShowNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({
  bookings,
  onSelectBooking,
  onNavigateToEntryGate,
  onNavigateToExitGate,
  onNavigateToSearch,
  onShowNotification
}) => {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'CHECKED_IN' | 'COMPLETED'>('ALL');

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'ACTIVE') return b.status === 'CONFIRMED';
    if (filter === 'CHECKED_IN') return b.status === 'CHECKED_IN';
    if (filter === 'COMPLETED') return b.status === 'COMPLETED' || b.status === 'NO_SHOW' || b.status === 'CANCELLED';
    return true;
  });

  const handleCancel = (booking: Booking) => {
    if (window.confirm(`Are you sure you want to cancel booking ${booking.id} for slot ${booking.slotNumber}?`)) {
      storageService.updateBookingStatus(booking.id, 'CANCELLED');
      const slot = storageService.getSlot(booking.slotId);
      if (slot) {
        storageService.updateSlot({
          ...slot,
          state: 'AVAILABLE',
          currentBookingId: undefined,
          currentVehicleNumber: undefined
        });
      }
      onShowNotification(`Booking ${booking.id} has been cancelled. Slot ${booking.slotNumber} released.`, 'info');
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded text-xs font-semibold">Confirmed · Slot Reserved</span>;
      case 'CHECKED_IN':
        return <span className="text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded text-xs font-semibold">Checked In · Vehicle Inside</span>;
      case 'COMPLETED':
        return <span className="text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded text-xs font-semibold">Completed</span>;
      case 'NO_SHOW':
        return <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded text-xs font-semibold">No-Show Lapsed</span>;
      case 'CANCELLED':
        return <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded text-xs font-semibold">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            My Parking Bookings
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Access your digital QR tickets, simulate arrival at the parking gate, or track your parking history.
          </p>
        </div>

        <button
          onClick={onNavigateToSearch}
          className="self-start sm:self-auto py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
        >
          + Reserve New Slot
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit text-xs font-medium">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            filter === 'ALL' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All ({bookings.length})
        </button>
        <button
          onClick={() => setFilter('ACTIVE')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            filter === 'ACTIVE' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Confirmed ({bookings.filter((b) => b.status === 'CONFIRMED').length})
        </button>
        <button
          onClick={() => setFilter('CHECKED_IN')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            filter === 'CHECKED_IN' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Inside Facility ({bookings.filter((b) => b.status === 'CHECKED_IN').length})
        </button>
        <button
          onClick={() => setFilter('COMPLETED')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            filter === 'COMPLETED' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Past / Completed
        </button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Car className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Bookings Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any bookings matching this category. Reserve a slot at one of our prototype Vizag facilities.
          </p>
          <button
            onClick={onNavigateToSearch}
            className="mt-2 inline-flex items-center gap-1.5 py-2 px-4 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
          >
            Find Available Slots
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Details */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-sm text-slate-900">{b.id}</span>
                  {getStatusBadge(b.status)}
                  <span className="text-[11px] text-slate-400 font-mono">TKT: {b.ticketId}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{b.facilityName}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1">
                    <span className="flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      Slot: {b.slotNumber}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Car className="w-3.5 h-3.5 text-slate-400" />
                      {b.vehicleNumber} ({b.vehicleType})
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {b.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {b.entryTime} ({b.durationHours} hrs)
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <button
                  onClick={() => onSelectBooking(b)}
                  className="py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  View QR Ticket
                </button>

                {b.status === 'CONFIRMED' && (
                  <>
                    <button
                      onClick={() => onNavigateToEntryGate(b.id)}
                      className="py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <span>Simulate Gate Scan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleCancel(b)}
                      className="py-2 px-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Cancel Booking"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </>
                )}

                {b.status === 'CHECKED_IN' && (
                  <button
                    onClick={() => onNavigateToExitGate(b.id)}
                    className="py-2 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Proceed to Exit Gate</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
