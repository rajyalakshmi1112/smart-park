import React, { useState, useEffect } from 'react';
import { QrCode, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Car, RefreshCw, Volume2, Sparkles } from 'lucide-react';
import { Booking, ParkingFacility } from '../../types';
import { storageService } from '../../services/storage';
import { validateEntryGateTicket, executeGateEntryCheckIn } from '../../services/gateValidation';

interface SmartEntryGateProps {
  facilities: ParkingFacility[];
  prefillBookingId?: string;
  autoScan?: boolean;
  onNavigateToTicket: (bookingId: string) => void;
  onNavigateToExitGate: (bookingId: string) => void;
  onNavigateToAdmin: () => void;
}

type GateState = 'CLOSED' | 'VALIDATING' | 'VERIFIED' | 'OPENING' | 'OPEN' | 'CLOSING' | 'DENIED';

export const SmartEntryGate: React.FC<SmartEntryGateProps> = ({
  facilities,
  prefillBookingId,
  autoScan,
  onNavigateToTicket,
  onNavigateToExitGate,
  onNavigateToAdmin
}) => {
  // Currently simulated gate facility
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(
    facilities[0]?.id || 'fac-cmr-maddilapalem'
  );

  // Input QR code or booking ID
  const [ticketInput, setTicketInput] = useState<string>(prefillBookingId || '');
  const [gateState, setGateState] = useState<GateState>('CLOSED');
  const [validationResult, setValidationResult] = useState<{
    booking?: Booking;
    reason?: string;
  } | null>(null);

  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);

  // Reload bookings
  useEffect(() => {
    const refresh = () => {
      setActiveBookings(storageService.getBookings());
    };
    refresh();
    const unsub = storageService.getFacilities(); // trigger init
    return () => {};
  }, []);

  // Update when prefill changes
  useEffect(() => {
    if (prefillBookingId) {
      setTicketInput(prefillBookingId);
      const b = storageService.getBooking(prefillBookingId);
      if (b) {
        setSelectedFacilityId(b.facilityId);
      }
      if (autoScan) {
        handleTriggerScan(prefillBookingId, b?.facilityId || selectedFacilityId);
      }
    }
  }, [prefillBookingId, autoScan]);

  const handleTriggerScan = (codeToTest?: string, facilityIdToTest?: string) => {
    const code = (codeToTest || ticketInput).trim();
    const facId = facilityIdToTest || selectedFacilityId;

    if (!code) return;

    setGateState('VALIDATING');
    setValidationResult(null);

    // Simulate optical scan latency (600ms)
    setTimeout(() => {
      const res = validateEntryGateTicket(code, facId, true);

      if (res.isValid && res.booking) {
        // Valid flow (Section 11)
        setValidationResult({ booking: res.booking });
        setGateState('VERIFIED');

        // Step 2: Gate Opening
        setTimeout(() => {
          setGateState('OPENING');

          setTimeout(() => {
            // Step 3: Gate Open & Check-in executed
            executeGateEntryCheckIn(res.booking!);
            setGateState('OPEN');

            // Step 4: After 4 seconds, gate automatically closes
            setTimeout(() => {
              setGateState('CLOSING');
              setTimeout(() => {
                setGateState('CLOSED');
              }, 1200);
            }, 3800);
          }, 1200);
        }, 1500);
      } else {
        // Invalid flow (Section 12)
        setValidationResult({ reason: res.reason, booking: res.booking });
        setGateState('DENIED');
      }
    }, 650);
  };

  const handleResetGate = () => {
    setGateState('CLOSED');
    setValidationResult(null);
  };

  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId) || facilities[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Facility Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full mb-2">
            <span>Simulated Automated Barrier Hardware</span>
            <span aria-hidden="true">·</span>
            <span>Optical QR Validator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Smart Entry Gate
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Simulated barrier infrastructure for Visakhapatnam parking facilities.
          </p>
        </div>

        {/* Gate Facility Selector */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Simulate Gate At:</label>
          <select
            value={selectedFacilityId}
            onChange={(e) => {
              setSelectedFacilityId(e.target.value);
              handleResetGate();
            }}
            className="w-full text-xs font-semibold py-2 px-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500"
          >
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* HARDWARE GATE SIMULATOR CONSOLE */}
      <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-8">
        {/* Gate Top Bar & Telemetry Status */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">🚧</span>
            <div>
              <div className="text-xs uppercase font-mono tracking-widest text-slate-400">
                LANE 01 · AUTOMATED INGRESS
              </div>
              <div className="text-sm font-bold text-white uppercase tracking-tight">
                {selectedFacility?.name}
              </div>
            </div>
          </div>

          {/* Traffic Signal Indicator */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
            <span
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                gateState === 'OPEN' || gateState === 'OPENING'
                  ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]'
                  : 'bg-emerald-950'
              }`}
            />
            <span
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                gateState === 'VALIDATING' || gateState === 'VERIFIED'
                  ? 'bg-amber-400 shadow-[0_0_12px_#f59e0b]'
                  : 'bg-amber-950'
              }`}
            />
            <span
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                gateState === 'CLOSED' || gateState === 'DENIED' || gateState === 'CLOSING'
                  ? 'bg-rose-500 shadow-[0_0_12px_#ef4444]'
                  : 'bg-rose-950'
              }`}
            />
          </div>
        </div>

        {/* PHYSICAL BARRIER ANIMATION DISPLAY */}
        <div className="relative bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 rounded-2xl border border-slate-800 p-8 min-h-[260px] flex flex-col items-center justify-center overflow-hidden">
          {/* LED Signboard */}
          <div className="w-full max-w-md bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-center shadow-inner mb-8">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              ELECTRONIC GUIDANCE BOARD
            </div>
            <div className="text-base sm:text-lg font-bold font-mono tracking-wider mt-0.5">
              {gateState === 'CLOSED' && <span className="text-slate-300">Scan your SmartPark ticket</span>}
              {gateState === 'VALIDATING' && <span className="text-amber-400 animate-pulse">VALIDATING TICKET...</span>}
              {gateState === 'VERIFIED' && <span className="text-emerald-400">✓ BOOKING VERIFIED</span>}
              {gateState === 'OPENING' && <span className="text-emerald-400 animate-pulse">GATE OPENING...</span>}
              {gateState === 'OPEN' && <span className="text-emerald-300 font-extrabold">🟢 GATE OPEN</span>}
              {gateState === 'CLOSING' && <span className="text-amber-400">GATE CLOSING...</span>}
              {gateState === 'DENIED' && <span className="text-rose-400 font-bold">✕ ENTRY DENIED</span>}
            </div>
          </div>

          {/* Boom Barrier Rig */}
          <div className="relative w-full max-w-lg h-24 flex items-end justify-between px-6">
            {/* Left Pylon / Stanchion */}
            <div className="w-14 h-24 bg-gradient-to-t from-slate-800 to-slate-700 rounded-t-lg border-t-2 border-x-2 border-slate-600 flex flex-col items-center justify-start p-2 shadow-2xl z-20">
              <div className="w-3 h-3 rounded-full bg-slate-950 border border-slate-500 mb-2" />
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            {/* The Boom Barrier Arm (Pivotable) */}
            <div
              className="absolute left-[70px] bottom-6 h-5 bg-repeat-x rounded-r transition-transform duration-1000 origin-left shadow-lg z-10"
              style={{
                width: 'calc(100% - 150px)',
                backgroundImage:
                  'repeating-linear-gradient(45deg, #ef4444, #ef4444 20px, #ffffff 20px, #ffffff 40px)',
                transform:
                  gateState === 'OPEN'
                    ? 'rotate(-85deg)'
                    : gateState === 'OPENING'
                      ? 'rotate(-45deg)'
                      : gateState === 'CLOSING'
                        ? 'rotate(-30deg)'
                        : 'rotate(0deg)'
              }}
            />

            {/* Right Receiving Post */}
            <div className="w-10 h-16 bg-slate-800 rounded-t border-t border-x border-slate-700 z-0 flex items-center justify-center">
              <div className="w-4 h-1 bg-amber-400" />
            </div>
          </div>

          {/* Status Label */}
          <div className="mt-6 flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">STATUS:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded ${
                gateState === 'OPEN' || gateState === 'OPENING'
                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                  : gateState === 'DENIED'
                    ? 'bg-rose-900/60 text-rose-300 border border-rose-700'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {gateState === 'OPEN'
                ? '🟢 GATE OPEN'
                : gateState === 'OPENING'
                  ? 'GATE OPENING...'
                  : gateState === 'DENIED'
                    ? '🔴 GATE CLOSED'
                    : 'GATE CLOSED'}
            </span>
          </div>
        </div>

        {/* FEEDBACK & VERIFICATION RESULTS DISPLAY */}
        {validationResult && (
          <div className="transition-all duration-300">
            {validationResult.booking && gateState !== 'DENIED' ? (
              /* Valid Flow (Section 11 Requirement) */
              <div className="bg-emerald-950/60 border border-emerald-600/60 rounded-2xl p-6 text-white space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-800/80">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-base font-bold text-emerald-300">✓ BOOKING VERIFIED</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-900/80 px-2 py-0.5 rounded">
                    Access Granted
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-emerald-400/80 block text-[11px]">Booking ID</span>
                    <span className="text-sm font-bold text-white">{validationResult.booking.id}</span>
                  </div>

                  <div>
                    <span className="text-emerald-400/80 block text-[11px]">Vehicle Number</span>
                    <span className="text-sm font-bold text-white">
                      {validationResult.booking.vehicleNumber} ({validationResult.booking.vehicleType})
                    </span>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-emerald-400/80 block text-[11px]">Assigned Slot</span>
                    <span className="text-xl font-extrabold text-emerald-300">
                      SLOT {validationResult.booking.slotNumber}
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-xs text-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-emerald-900/60">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Welcome to SmartPark Vizag! Please proceed to designated bay.</span>
                  </div>
                  <span className="text-[11px] text-emerald-400/80 font-mono">
                    {gateState === 'CLOSED' ? 'Gate automatically closed' : 'Barrier cycle in progress'}
                  </span>
                </div>
              </div>
            ) : (
              /* Invalid Flow (Section 12 Requirement) */
              <div className="bg-rose-950/60 border border-rose-600/60 rounded-2xl p-6 text-white space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-rose-800/80">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    <span className="text-base font-bold text-rose-300">✕ ENTRY DENIED</span>
                  </div>
                  <span className="text-xs font-mono text-rose-300 bg-rose-900/80 px-2 py-0.5 rounded">
                    🔴 GATE CLOSED
                  </span>
                </div>

                <p className="text-xs text-rose-200 leading-relaxed">
                  Reason: <strong>{validationResult.reason || 'Verification failure.'}</strong>
                </p>

                {validationResult.booking && (
                  <div className="text-[11px] font-mono text-rose-300/80 pt-1">
                    Booking: {validationResult.booking.id} · Facility: {validationResult.booking.facilityName} · Status: {validationResult.booking.status}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* SCANNER INTERFACE & TICKET SELECTION */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Scan / Submit QR Ticket
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Optical Sensor Simulation</span>
          </div>

          {/* Quick select active tickets from stored bookings */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400">Quick-Select Issued Ticket:</span>
            <div className="flex flex-wrap gap-2">
              {activeBookings
                .filter((b) => b.facilityId === selectedFacilityId)
                .slice(0, 4)
                .map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setTicketInput(b.id);
                      handleTriggerScan(b.id);
                    }}
                    className={`py-1.5 px-3 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                      ticketInput === b.id
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <span>{b.id}</span>
                    <span className="text-[10px] text-slate-400 font-sans">({b.slotNumber})</span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-400'
                          : b.status === 'CHECKED_IN'
                            ? 'bg-blue-400'
                            : 'bg-slate-500'
                      }`}
                    />
                  </button>
                ))}
            </div>
          </div>

          {/* Manual Input Form */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value.toUpperCase())}
              placeholder="Enter Booking ID (e.g. SPV-48291) or Ticket Identifier"
              className="flex-1 py-2.5 px-4 text-xs font-mono uppercase bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              onClick={() => handleTriggerScan()}
              disabled={gateState === 'VALIDATING' || !ticketInput.trim()}
              className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:bg-slate-800 disabled:text-slate-500"
            >
              {gateState === 'VALIDATING' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan QR Ticket</span>
                </>
              )}
            </button>

            {gateState !== 'CLOSED' && (
              <button
                onClick={handleResetGate}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          {/* Preset Invalid Test Buttons for evaluators */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] text-slate-500">Test Rejection Logic:</span>
            <button
              onClick={() => {
                setTicketInput('SPV-INVALID-000');
                handleTriggerScan('SPV-INVALID-000');
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
            >
              Unrecognized ID
            </button>
            <button
              onClick={() => {
                // Find a completed or no-show
                const expired = activeBookings.find((b) => b.status === 'NO_SHOW' || b.status === 'COMPLETED');
                if (expired) {
                  setTicketInput(expired.id);
                  handleTriggerScan(expired.id);
                } else {
                  setTicketInput('SPV-48255');
                  handleTriggerScan('SPV-48255');
                }
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
            >
              Expired / No-Show Ticket
            </button>
          </div>
        </div>

        {/* Bottom Helper Shortcuts */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateToAdmin}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <span>View live updates in Admin Console</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={() => onNavigateToExitGate(ticketInput)}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Switch to Smart Exit Gate →
          </button>
        </div>
      </div>
    </div>
  );
};
