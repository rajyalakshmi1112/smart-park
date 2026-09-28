import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { ArrowLeft, Printer, QrCode, ShieldCheck, Clock, MapPin, Car, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Booking } from '../../types';

interface QRTicketCardProps {
  booking: Booking;
  onBack: () => void;
  onNavigateToGate: (bookingId: string) => void;
}

export const QRTicketCard: React.FC<QRTicketCardProps> = ({
  booking,
  onBack,
  onNavigateToGate
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [qrGenerated, setQrGenerated] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      // The QR code data payload encodes a structured ticket string
      const payload = JSON.stringify({
        app: 'SmartParkVizag',
        bookingId: booking.id,
        ticketId: booking.ticketId,
        facilityId: booking.facilityId,
        slotNumber: booking.slotNumber,
        vehicleNumber: booking.vehicleNumber,
        entryTime: booking.entryTime
      });

      QRCode.toCanvas(
        canvasRef.current,
        payload,
        {
          width: 230,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        },
        (error) => {
          if (!error) {
            setQrGenerated(true);
          }
        }
      );
    }
  }, [booking]);

  const handlePrint = () => {
    window.print();
  };

  const getStatusDisplay = () => {
    switch (booking.status) {
      case 'CONFIRMED':
        return { label: 'VALID', color: 'bg-emerald-600 text-white' };
      case 'CHECKED_IN':
        return { label: 'CHECKED IN', color: 'bg-blue-600 text-white' };
      case 'COMPLETED':
        return { label: 'COMPLETED', color: 'bg-slate-700 text-white' };
      case 'NO_SHOW':
        return { label: 'NO SHOW', color: 'bg-amber-600 text-white' };
      case 'CANCELLED':
        return { label: 'CANCELLED', color: 'bg-rose-600 text-white' };
      default:
        return { label: 'VALID', color: 'bg-emerald-600 text-white' };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Bookings
        </button>

        <button
          onClick={handlePrint}
          className="text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5 flex items-center gap-1.5 bg-white shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          Print Ticket
        </button>
      </div>

      {/* TICKET PASS CONTAINER (Boarding Pass Style) */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden print:shadow-none print:border-black print:m-0">
        {/* Ticket Header */}
        <div className="bg-slate-900 text-white p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center text-slate-950 font-bold font-mono text-xs">
                P
              </div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-200">
                SMARTPARK VIZAG
              </span>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded tracking-wide ${status.color}`}>
              {status.label}
            </span>
          </div>

          <div className="pt-2">
            <h2 className="text-xl font-extrabold tracking-tight uppercase">
              {booking.facilityName}
            </h2>
            <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider mt-0.5">
              PROTOTYPE FACILITY
            </div>
          </div>
        </div>

        {/* Prominent Slot Callout */}
        <div className="bg-emerald-50 border-y border-emerald-200 px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              ASSIGNED PARKING BAY
            </span>
            <div className="text-3xl font-extrabold text-emerald-950 font-mono-numbers tracking-tight">
              SLOT {booking.slotNumber}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-800 font-semibold uppercase tracking-wider">
              ARRIVAL WINDOW
            </span>
            <div className="text-xs font-bold text-emerald-950 font-mono-numbers">
              {booking.allowedArrivalStart} – {booking.allowedArrivalEnd}
            </div>
          </div>
        </div>

        {/* QR Code Canvas Section */}
        <div className="p-6 flex flex-col items-center justify-center bg-white border-b border-dashed border-slate-300 relative">
          {/* Notches on left & right for authentic ticket look */}
          <div className="w-6 h-6 rounded-full bg-slate-50 border-r border-slate-300 absolute -left-3 top-1/2 -translate-y-1/2" />
          <div className="w-6 h-6 rounded-full bg-slate-50 border-l border-slate-300 absolute -right-3 top-1/2 -translate-y-1/2" />

          <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-inner">
            <canvas ref={canvasRef} className="rounded-lg" />
          </div>

          <div className="mt-3 text-center space-y-0.5">
            <div className="text-xs font-mono font-bold text-slate-800">
              BOOKING: {booking.id}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              TICKET IDENTIFIER: {booking.ticketId}
            </div>
          </div>
        </div>

        {/* Ticket Metadata Grid */}
        <div className="p-6 bg-slate-50/60 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 uppercase text-[10px] tracking-wider font-semibold block">
              VEHICLE
            </span>
            <span className="font-bold text-slate-900 font-mono text-sm">{booking.vehicleNumber}</span>
            <span className="text-slate-500 block text-[11px]">{booking.vehicleType}</span>
          </div>

          <div>
            <span className="text-slate-400 uppercase text-[10px] tracking-wider font-semibold block">
              ENTRY
            </span>
            <span className="font-bold text-slate-900 text-sm">{booking.entryTime}</span>
            <span className="text-slate-500 block text-[11px]">{booking.date}</span>
          </div>

          <div>
            <span className="text-slate-400 uppercase text-[10px] tracking-wider font-semibold block">
              DURATION
            </span>
            <span className="font-bold text-slate-900 text-sm">{booking.durationHours} HOURS</span>
            <span className="text-slate-500 block text-[11px]">Exp: {booking.exitExpectedTime}</span>
          </div>

          <div>
            <span className="text-slate-400 uppercase text-[10px] tracking-wider font-semibold block">
              PAYMENT
            </span>
            <span className="font-bold text-emerald-800 text-sm font-mono-numbers">₹{booking.estimatedPrice}</span>
            <span className="text-emerald-700 block text-[10px] font-medium truncate max-w-[130px]" title={booking.paymentMethod || 'Confirmed'}>
              {booking.paymentMethod || 'Confirmed'}
            </span>
          </div>
        </div>

        {/* Ticket Bottom Security Notice */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
          <span>Present this QR ticket at the barrier optical scanner</span>
        </div>
      </div>

      {/* Action: Show QR at Gate (Direct Simulator Jump) */}
      <div className="space-y-3">
        {booking.status === 'CONFIRMED' && (
          <button
            onClick={() => onNavigateToGate(booking.id)}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Show QR at Smart Entry Gate</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {booking.status === 'CHECKED_IN' && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 text-center">
            Vehicle is currently checked in at slot <strong>{booking.slotNumber}</strong>. When leaving, proceed to the Smart Exit Gate.
          </div>
        )}
      </div>
    </div>
  );
};
