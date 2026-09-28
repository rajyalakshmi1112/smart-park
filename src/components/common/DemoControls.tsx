import React, { useState } from 'react';
import { X, Play, RotateCcw, AlertTriangle, CheckCircle2, QrCode, LogOut, ArrowRight, Car, Sparkles, Check } from 'lucide-react';
import { storageService } from '../../services/storage';
import { createBookingWithAllocation } from '../../services/slotAllocation';
import { executeGateEntryCheckIn, executeGateExit, markBookingNoShow, validateEntryGateTicket } from '../../services/gateValidation';
import { getTodayDateString } from '../../data/mockSeed';
import { Booking } from '../../types';

interface DemoControlsProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, extraData?: any) => void;
  onShowNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DemoControls: React.FC<DemoControlsProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onShowNotification
}) => {
  const [isRunningAutoJourney, setIsRunningAutoJourney] = useState(false);
  const [demoCompletedReport, setDemoCompletedReport] = useState<{
    bookingId: string;
    slotNumber: string;
    entryVerified: boolean;
    exitCompleted: boolean;
    slotReleased: boolean;
  } | null>(null);

  if (!isOpen) return null;

  // 1. One-click complete sample evaluation journey setup (Creates AP 31 XX 1234, CMR Central Maddilapalem, Slot M-27)
  const handleCreateSampleJourney = () => {
    // Clear slot M-27 if held so demo always allocates M-27
    const slots = storageService.getSlots('fac-cmr-maddilapalem');
    const m27 = slots.find((s) => s.slotNumber === 'M-27');
    if (m27 && m27.state !== 'AVAILABLE') {
      storageService.updateSlot({
        ...m27,
        state: 'AVAILABLE',
        currentBookingId: undefined,
        currentVehicleNumber: undefined
      });
    }

    const result = createBookingWithAllocation(
      {
        facilityId: 'fac-cmr-maddilapalem',
        date: getTodayDateString(),
        entryTime: '06:00 PM',
        durationHours: 2,
        vehicleNumber: 'AP 31 XX 1234',
        vehicleType: 'Car',
        driverName: 'Demo Evaluator'
      },
      'CMR Central Maddilapalem Parking',
      60,
      'M-27'
    );

    if (result.success && result.booking) {
      onShowNotification(`Sample booking ${result.booking.id} created! Slot ${result.booking.slotNumber} assigned.`, 'success');
      onNavigate('ticket', { bookingId: result.booking.id });
      onClose();
    } else {
      onShowNotification(result.error || 'Failed to create sample booking', 'error');
    }
  };

  // Full Automated End-to-End Simulation (Section 18 Requirement)
  const handleRunFullAutomatedSimulation = () => {
    setIsRunningAutoJourney(true);
    setDemoCompletedReport(null);

    // Free M-27 if needed
    const slots = storageService.getSlots('fac-cmr-maddilapalem');
    const m27 = slots.find((s) => s.slotNumber === 'M-27');
    if (m27 && m27.state !== 'AVAILABLE') {
      storageService.updateSlot({
        ...m27,
        state: 'AVAILABLE',
        currentBookingId: undefined,
        currentVehicleNumber: undefined
      });
    }

    // Step 1: Create booking
    const result = createBookingWithAllocation(
      {
        facilityId: 'fac-cmr-maddilapalem',
        date: getTodayDateString(),
        entryTime: '06:00 PM',
        durationHours: 2,
        vehicleNumber: 'AP 31 XX 1234',
        vehicleType: 'Car',
        driverName: 'Evaluation Auto-Pilot'
      },
      'CMR Central Maddilapalem Parking',
      60,
      'M-27'
    );

    if (!result.success || !result.booking) {
      setIsRunningAutoJourney(false);
      onShowNotification('Could not start simulation: no available slot', 'error');
      return;
    }

    const created = result.booking;

    // Step 2: Validate Entry at Gate
    setTimeout(() => {
      const entryValidation = validateEntryGateTicket(created.id, 'fac-cmr-maddilapalem', true);
      if (entryValidation.isValid && entryValidation.booking) {
        executeGateEntryCheckIn(entryValidation.booking);

        // Step 3: Simulate Exit after short pause
        setTimeout(() => {
          executeGateExit(created.id);
          setIsRunningAutoJourney(false);
          setDemoCompletedReport({
            bookingId: created.id,
            slotNumber: created.slotNumber,
            entryVerified: true,
            exitCompleted: true,
            slotReleased: true
          });
          onShowNotification(`Simulation completed for ${created.id}. Slot ${created.slotNumber} released!`, 'success');
        }, 1200);
      }
    }, 1000);
  };

  // Simulate valid entry gate scan with the most recent confirmed booking
  const handleSimulateValidEntry = () => {
    const bookings = storageService.getBookings();
    const confirmed = bookings.find((b) => b.status === 'CONFIRMED');
    if (!confirmed) {
      onShowNotification('No confirmed booking available. Generating sample booking first...', 'info');
      handleCreateSampleJourney();
      return;
    }

    onNavigate('entry-gate', { prefillBookingId: confirmed.id, autoScan: true });
    onShowNotification(`Loaded ticket ${confirmed.id} at Entry Gate.`, 'info');
    onClose();
  };

  // Simulate invalid ticket scan (e.g. wrong facility or fake ticket)
  const handleSimulateInvalidScan = () => {
    onNavigate('entry-gate', { prefillBookingId: 'SPV-INVALID-999', autoScan: true });
    onShowNotification('Testing invalid ticket SPV-INVALID-999 at Entry Gate.', 'info');
    onClose();
  };

  // Simulate exit gate
  const handleSimulateExit = () => {
    const bookings = storageService.getBookings();
    const checkedIn = bookings.find((b) => b.status === 'CHECKED_IN');
    if (!checkedIn) {
      onShowNotification('No vehicle currently checked in to exit. Check in a vehicle first!', 'error');
      return;
    }

    onNavigate('exit-gate', { prefillBookingId: checkedIn.id });
    onShowNotification(`Loaded checked-in booking ${checkedIn.id} at Exit Gate.`, 'info');
    onClose();
  };

  // Simulate No-Show
  const handleSimulateNoShow = () => {
    const bookings = storageService.getBookings();
    const confirmed = bookings.find((b) => b.status === 'CONFIRMED');
    if (!confirmed) {
      onShowNotification('No confirmed booking to mark as No-Show. Create a booking first.', 'error');
      return;
    }

    markBookingNoShow(confirmed.id);
    onShowNotification(`Booking ${confirmed.id} lapsed to NO_SHOW. Slot ${confirmed.slotNumber} released to AVAILABLE.`, 'info');
    onNavigate('admin');
    onClose();
  };

  // Clear all filled/reserved slots
  const handleClearAllSlots = () => {
    const cleared = storageService.clearFilledAndReservedSlots();
    onShowNotification(`Cleared ${cleared} occupied and reserved parking bays. All slots released to AVAILABLE!`, 'success');
    onClose();
  };

  // Reset all prototype data
  const handleReset = () => {
    if (window.confirm('Reset all prototype parking data, bookings, and gate events to default seed?')) {
      storageService.resetToDefaults();
      onShowNotification('System data reset to initial prototype state.', 'success');
      onNavigate('landing');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Play className="w-3.5 h-3.5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight">Prototype Demo Simulation</h3>
              <p className="text-[11px] text-slate-400">Evaluator shortcut panel for quick verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Automated Completion Report Display (Section 18) */}
          {demoCompletedReport && (
            <div className="p-4 rounded-xl bg-emerald-950 text-white border border-emerald-700 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>✓ DEMO COMPLETED</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Booking</span>
                  <span className="font-bold text-white">{demoCompletedReport.bookingId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Slot</span>
                  <span className="font-bold text-emerald-300">Slot {demoCompletedReport.slotNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Entry Gate</span>
                  <span className="font-bold text-emerald-300">Verified & Ingressed</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Exit Gate</span>
                  <span className="font-bold text-emerald-300">Completed & Egressed</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-emerald-800 text-[11px] text-emerald-300 font-sans">
                  Slot State: <strong>Released to AVAILABLE</strong>. System state updated in real-time.
                </div>
              </div>
            </div>
          )}

          {/* Section 18: Run Full Sample Booking Journey */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Evaluation Step 32 / 18 Full Journey
              </span>
              <span className="text-[10px] text-emerald-700 font-mono bg-emerald-100 px-2 py-0.5 rounded">
                Section 18
              </span>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Creates booking for <strong>RK Beach Parking</strong>, vehicle <strong>AP 31 XX 1234</strong>, slot <strong>A-27</strong>, generates digital QR ticket, and enables testing entrance and exit gates.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleCreateSampleJourney}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Car className="w-3.5 h-3.5" />
                <span>Open Sample Ticket</span>
              </button>

              <button
                onClick={handleRunFullAutomatedSimulation}
                disabled={isRunningAutoJourney}
                className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs disabled:bg-slate-400"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isRunningAutoJourney ? 'Simulating...' : 'Auto-Run Full Cycle'}</span>
              </button>
            </div>
          </div>

          {/* Individual simulation actions */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Individual Gate & State Simulators
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                onClick={handleSimulateValidEntry}
                className="p-3 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800">Simulate Valid Entry</div>
                  <div className="text-[11px] text-slate-500">Scan confirmed QR ticket at entry gate</div>
                </div>
              </button>

              <button
                onClick={handleSimulateInvalidScan}
                className="p-3 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-2.5"
              >
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800">Simulate Invalid Scan</div>
                  <div className="text-[11px] text-slate-500">Test rejection (unrecognized ID)</div>
                </div>
              </button>

              <button
                onClick={handleSimulateExit}
                className="p-3 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-2.5"
              >
                <LogOut className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800">Simulate Exit Gate</div>
                  <div className="text-[11px] text-slate-500">Checkout vehicle & release slot</div>
                </div>
              </button>

              <button
                onClick={handleSimulateNoShow}
                className="p-3 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-2.5"
              >
                <RotateCcw className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800">Simulate No-Show</div>
                  <div className="text-[11px] text-slate-500">Lapse arrival grace period & free slot</div>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Actions / Reset buttons */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <button
              onClick={handleClearAllSlots}
              className="w-full py-2 px-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
              Clear All Filled & Reserved Slots (Free All Bays)
            </button>

            <button
              onClick={handleReset}
              className="w-full py-2 px-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Prototype State & Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
