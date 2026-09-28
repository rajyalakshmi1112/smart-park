import React, { useState, useEffect } from 'react';
import { LogOut, CheckCircle2, AlertTriangle, ArrowRight, Car, RefreshCw, Sparkles, Clock, QrCode } from 'lucide-react';
import { Booking } from '../../types';
import { storageService } from '../../services/storage';
import { executeGateExit } from '../../services/gateValidation';

interface SmartExitGateProps {
  prefillBookingId?: string;
  onNavigateToSearch: () => void;
  onNavigateToAdmin: () => void;
  onNavigateToEntryGate: () => void;
}

type ExitGateState = 'IDLE' | 'PROCESSING' | 'EXIT_APPROVED' | 'BARRIER_OPEN' | 'COMPLETED' | 'ERROR';

export const SmartExitGate: React.FC<SmartExitGateProps> = ({
  prefillBookingId,
  onNavigateToSearch,
  onNavigateToAdmin,
  onNavigateToEntryGate
}) => {
  const [ticketInput, setTicketInput] = useState<string>(prefillBookingId || '');
  const [exitState, setExitState] = useState<ExitGateState>('IDLE');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);
  const [checkedInVehicles, setCheckedInVehicles] = useState<Booking[]>([]);

  useEffect(() => {
    const refresh = () => {
      const all = storageService.getBookings();
      setCheckedInVehicles(all.filter((b) => b.status === 'CHECKED_IN'));
    };
    refresh();
    const unsub = storageService.getFacilities();
    return () => {};
  }, [exitState]);

  useEffect(() => {
    if (prefillBookingId) {
      setTicketInput(prefillBookingId);
    }
  }, [prefillBookingId]);

  const handleProcessExit = (targetBookingId?: string) => {
    const idToUse = (targetBookingId || ticketInput).trim();
    if (!idToUse) return;

    setErrorMsg(null);
    setExitState('PROCESSING');

    setTimeout(() => {
      const result = executeGateExit(idToUse);

      if (result.success && result.booking) {
        setCompletedBooking(result.booking);
        setExitState('EXIT_APPROVED');

        setTimeout(() => {
          setExitState('BARRIER_OPEN');

          setTimeout(() => {
            setExitState('COMPLETED');
          }, 3000);
        }, 1000);
      } else {
        setErrorMsg(result.error || 'Vehicle is not currently registered inside the facility.');
        setExitState('ERROR');
      }
    }, 700);
  };

  const handleReset = () => {
    setExitState('IDLE');
    setErrorMsg(null);
    setCompletedBooking(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-800 bg-blue-50 px-3 py-1 rounded-full mb-2">
          <span>Automated Barrier System</span>
          <span aria-hidden="true">·</span>
          <span>Egress & Slot Release Terminal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Smart Exit Gate
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Validate departure, release occupied slot back to available pool, and record completion telemetry.
        </p>
      </div>

      {/* HARDWARE EXIT GATE RIG */}
      <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">🏁</span>
            <div>
              <div className="text-xs uppercase font-mono tracking-widest text-slate-400">
                LANE 02 · AUTOMATED EGRESS
              </div>
              <div className="text-sm font-bold text-white uppercase tracking-tight">
                Simulated Exit Terminal
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
            <span
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                exitState === 'BARRIER_OPEN' || exitState === 'EXIT_APPROVED'
                  ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]'
                  : 'bg-emerald-950'
              }`}
            />
            <span
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                exitState === 'PROCESSING' ? 'bg-amber-400 shadow-[0_0_12px_#f59e0b]' : 'bg-amber-950'
              }`}
            />
            <span
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                exitState === 'IDLE' || exitState === 'ERROR' ? 'bg-rose-500 shadow-[0_0_12px_#ef4444]' : 'bg-rose-950'
              }`}
            />
          </div>
        </div>

        {/* Physical Exit Barrier Graphic */}
        <div className="relative bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 rounded-2xl border border-slate-800 p-8 min-h-[220px] flex flex-col items-center justify-center overflow-hidden">
          {/* LED Ticker */}
          <div className="w-full max-w-md bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-center shadow-inner mb-6">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              EXIT TERMINAL GUIDANCE
            </div>
            <div className="text-base sm:text-lg font-bold font-mono tracking-wider mt-0.5">
              {exitState === 'IDLE' && <span className="text-slate-300">AWAITING VEHICLE DEPARTURE</span>}
              {exitState === 'PROCESSING' && <span className="text-amber-400 animate-pulse">PROCESSING EXIT...</span>}
              {exitState === 'EXIT_APPROVED' && (
                <span className="text-emerald-400">
                  VEHICLE VERIFIED · BOOKING {completedBooking?.id} · SLOT {completedBooking?.slotNumber}
                </span>
              )}
              {exitState === 'BARRIER_OPEN' && (
                <div className="space-y-0.5">
                  <div className="text-emerald-300 font-extrabold">🟢 GATE OPEN</div>
                  <div className="text-xs text-emerald-400 font-sans">Thank you for using SmartPark Vizag</div>
                </div>
              )}
              {exitState === 'COMPLETED' && <span className="text-slate-300">GATE CLOSED · Thank you for using SmartPark Vizag</span>}
              {exitState === 'ERROR' && <span className="text-rose-400">✕ EGRESS DENIED</span>}
            </div>
          </div>

          {/* Boom Barrier */}
          <div className="relative w-full max-w-lg h-20 flex items-end justify-between px-6">
            <div className="w-12 h-20 bg-slate-800 rounded-t-lg border-t-2 border-x-2 border-slate-600 flex flex-col items-center justify-start p-2 shadow-2xl z-20">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            </div>

            <div
              className="absolute left-[64px] bottom-5 h-5 bg-repeat-x rounded-r transition-transform duration-1000 origin-left shadow-lg z-10"
              style={{
                width: 'calc(100% - 140px)',
                backgroundImage:
                  'repeating-linear-gradient(45deg, #3b82f6, #3b82f6 20px, #ffffff 20px, #ffffff 40px)',
                transform:
                  exitState === 'BARRIER_OPEN'
                    ? 'rotate(-85deg)'
                    : exitState === 'EXIT_APPROVED'
                      ? 'rotate(-45deg)'
                      : 'rotate(0deg)'
              }}
            />

            <div className="w-10 h-14 bg-slate-800 rounded-t border-t border-x border-slate-700 z-0 flex items-center justify-center">
              <div className="w-4 h-1 bg-blue-400" />
            </div>
          </div>
        </div>

        {/* Result Message (Section 13) */}
        {completedBooking && (
          <div className="bg-emerald-950/70 border border-emerald-600/70 rounded-2xl p-6 text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-base font-bold text-emerald-300">
                  Thank you for using SmartPark Vizag
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-900 px-2 py-0.5 rounded">
                COMPLETED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-emerald-400/80 block text-[11px]">Booking</span>
                <span className="text-sm font-bold text-white">{completedBooking.id}</span>
              </div>
              <div>
                <span className="text-emerald-400/80 block text-[11px]">Vehicle</span>
                <span className="text-sm font-bold text-white">{completedBooking.vehicleNumber}</span>
              </div>
              <div>
                <span className="text-emerald-400/80 block text-[11px]">Released Slot</span>
                <span className="text-sm font-bold text-emerald-300">
                  Slot {completedBooking.slotNumber} → AVAILABLE
                </span>
              </div>
              <div>
                <span className="text-emerald-400/80 block text-[11px]">Exit Time</span>
                <span className="text-sm font-bold text-white">{completedBooking.completedAt || 'Now'}</span>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-950/60 border border-rose-600/60 rounded-xl p-4 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Vehicles Currently Inside Facility Picker */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Vehicles Currently Checked-In ({checkedInVehicles.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Select vehicle to depart</span>
          </div>

          {checkedInVehicles.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-center">
              No vehicles currently checked-in inside prototype facilities.
              <button
                onClick={onNavigateToEntryGate}
                className="ml-2 text-emerald-400 hover:underline font-semibold"
              >
                Scan an entry at Smart Entry Gate first
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {checkedInVehicles.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setTicketInput(v.id);
                    handleProcessExit(v.id);
                  }}
                  className={`p-3 text-left rounded-xl border transition-colors flex items-center justify-between ${
                    ticketInput === v.id
                      ? 'border-blue-500 bg-blue-950/40 text-white'
                      : 'border-slate-800 bg-slate-950/80 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                      <span>{v.id}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded font-sans">
                        Slot {v.slotNumber}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {v.vehicleNumber} ({v.vehicleType}) · {v.facilityName}
                    </div>
                  </div>
                  <LogOut className="w-4 h-4 text-blue-400 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Manual input */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value.toUpperCase())}
              placeholder="Or enter Booking ID (e.g. SPV-48270)"
              className="flex-1 py-2.5 px-4 text-xs font-mono uppercase bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleProcessExit()}
              disabled={exitState === 'PROCESSING' || !ticketInput.trim()}
              className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:bg-slate-800 disabled:text-slate-500"
            >
              {exitState === 'PROCESSING' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Authorize Exit</span>
                </>
              )}
            </button>
            {exitState !== 'IDLE' && (
              <button
                onClick={handleReset}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <button
            onClick={onNavigateToAdmin}
            className="hover:text-blue-400 transition-colors flex items-center gap-1"
          >
            <span>Check slot status in Admin Console</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={onNavigateToSearch}
            className="hover:text-emerald-400 transition-colors"
          >
            Reserve Another Slot →
          </button>
        </div>
      </div>
    </div>
  );
};
