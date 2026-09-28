import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Car,
  User,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { ParkingFacility, VehicleType, BookingFormData, Booking } from '../../types';
import { createBookingWithAllocation } from '../../services/slotAllocation';
import { storageService } from '../../services/storage';
import { getTodayDateString, getMaxDateString } from '../../data/mockSeed';

interface BookingWizardProps {
  facility: ParkingFacility;
  initialParams?: {
    date: string;
    entryTime: string;
    duration: number;
    vehicleType: VehicleType;
  };
  onCancel: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  facility,
  initialParams,
  onCancel,
  onBookingSuccess
}) => {
  // Steps: 2: Schedule, 3: Vehicle, 4: Confirm & Generate Ticket
  const [currentStep, setCurrentStep] = useState<number>(2);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [date, setDate] = useState(initialParams?.date || getTodayDateString());
  const [entryTime, setEntryTime] = useState(initialParams?.entryTime || '06:00 PM');
  const [durationHours, setDurationHours] = useState(initialParams?.duration || 2);
  const [vehicleType, setVehicleType] = useState<VehicleType>(initialParams?.vehicleType || 'Car');
  const [vehicleNumber, setVehicleNumber] = useState('AP 31 XX 1234');
  const [driverName, setDriverName] = useState('Raji Madhavi');

  // Rate calculation: Motorcycle ₹20/hr, Car ₹30/hr
  const hourlyRate = vehicleType === 'Motorcycle' ? 20 : 30;
  const estimatedPrice = hourlyRate * durationHours;

  // Slot preview: first available slot in sequential line order (01, 02, 03...)
  const availableSlots = storageService
    .getSlots(facility.id)
    .filter((s) => s.state === 'AVAILABLE')
    .sort((a, b) => {
      const numA = parseInt(a.slotNumber.replace(/[^0-9]/g, ''), 10) || 0;
      const numB = parseInt(b.slotNumber.replace(/[^0-9]/g, ''), 10) || 0;
      return numA - numB;
    });
  const previewSlot = availableSlots[0]?.slotNumber || 'Automated Assignment';

  const handleConfirmBooking = () => {
    setErrorMsg(null);
    setIsSubmitting(true);

    setTimeout(() => {
      try {
        const formData: BookingFormData = {
          facilityId: facility.id,
          date,
          entryTime,
          durationHours,
          vehicleNumber,
          vehicleType,
          driverName,
          paymentMethod: 'Instant Reservation'
        };

        const result = createBookingWithAllocation(formData, facility.name, estimatedPrice);

        if (result.success && result.booking) {
          setIsSubmitting(false);
          onBookingSuccess(result.booking);
        } else {
          setIsSubmitting(false);
          setErrorMsg(result.error || 'No slots available for this time. Try another parking location.');
        }
      } catch (e: any) {
        setIsSubmitting(false);
        setErrorMsg(e?.message || 'Unexpected error during slot booking.');
      }
    }, 400);
  };

  const handleNext = () => {
    setErrorMsg(null);
    if (currentStep === 3) {
      if (!vehicleNumber.trim()) {
        setErrorMsg('Please enter a valid vehicle registration number (e.g. AP 31 XX 1234).');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (currentStep === 2) {
      onCancel();
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 2));
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button & Facility context banner */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onCancel}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Parking Search
        </button>

        <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
          {facility.name}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Step Indicator Progress Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-6">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            {[
              { step: 1, label: '1. Parking' },
              { step: 2, label: '2. Schedule' },
              { step: 3, label: '3. Vehicle' },
              { step: 4, label: '4. Confirm & Ticket' }
            ].map((s) => {
              const isPassed = currentStep > s.step;
              const isCurrent = currentStep === s.step;
              return (
                <div key={s.step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isPassed
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                            ? 'bg-slate-900 text-white ring-4 ring-slate-100'
                            : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                    </div>
                    <span
                      className={`text-[11px] mt-1 hidden sm:block ${
                        isCurrent ? 'font-bold text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {s.step < 4 && (
                    <div
                      className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 ${
                        isPassed ? 'bg-emerald-600' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 2: Select Date & Time (Schedule) */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Step 2: Parking Schedule & Duration</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Select your arrival date, planned entry time, and parking duration.
                </p>
              </div>

              {/* Date Input */}
              <div className="space-y-2 max-w-sm">
                <label className="text-xs font-semibold text-slate-700">Reservation Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    value={date}
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
                      setDate(val);
                    }}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Entry Time Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Planned Arrival Time</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    '08:00 AM',
                    '10:00 AM',
                    '12:00 PM',
                    '02:00 PM',
                    '04:00 PM',
                    '06:00 PM',
                    '07:30 PM',
                    '09:00 PM'
                  ].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEntryTime(t)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                        entryTime === t
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Duration</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { hours: 1, label: '1 Hour' },
                    { hours: 2, label: '2 Hours (Standard)' },
                    { hours: 3, label: '3 Hours' },
                    { hours: 4, label: '4 Hours' }
                  ].map((item) => (
                    <button
                      key={item.hours}
                      type="button"
                      onClick={() => setDurationHours(item.hours)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        durationHours === item.hours
                          ? 'border-emerald-600 bg-emerald-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`text-xs font-bold ${
                          durationHours === item.hours ? 'text-emerald-900' : 'text-slate-800'
                        }`}
                      >
                        {item.label}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-mono-numbers">
                        ₹{hourlyRate * item.hours} est.
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Allowed arrival grace window: <strong>{entryTime} – +20 mins</strong> (until automatic no-show release).
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: Vehicle & Driver */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Step 3: Vehicle & Driver Information</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your vehicle details for optical barrier verification and slot allocation.
                </p>
              </div>

              <div className="space-y-4 max-w-md">
                {/* Vehicle Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Vehicle Type</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(['Car', 'Motorcycle'] as VehicleType[]).map((vt) => (
                      <button
                        key={vt}
                        type="button"
                        onClick={() => setVehicleType(vt)}
                        className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                          vehicleType === vt
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {vt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vehicle Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Vehicle Number (License Plate)
                  </label>
                  <div className="relative">
                    <Car className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. AP 31 XX 1234"
                      className="w-full pl-9 pr-3 py-2.5 text-sm font-mono uppercase font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Format: State code (AP 31) + Series + 4-digit number
                  </p>
                </div>

                {/* Driver Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Driver Name (Optional)</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="e.g. Suresh Varma"
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Confirm Booking */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Step 4: Review & Confirm Booking</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Verify your reservation details. Click confirm below to instantly generate your digital QR entry ticket.
                </p>
              </div>

              {/* Exact Summary Format */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] tracking-wider font-semibold block">
                      PARKING LOCATION
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{facility.name}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase text-[10px] tracking-wider font-semibold block">
                      DATE
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{date}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase text-[10px] tracking-wider font-semibold block">
                      ENTRY TIME
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{entryTime}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase text-[10px] tracking-wider font-semibold block">
                      DURATION
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{durationHours} hours</span>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase text-[10px] tracking-wider font-semibold block">
                      VEHICLE
                    </span>
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      {vehicleNumber} ({vehicleType})
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase text-[10px] tracking-wider font-semibold block">
                      SEQUENTIAL SLOT ASSIGNMENT
                    </span>
                    <span className="font-extrabold text-emerald-800 text-sm font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                      {previewSlot}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase text-[10px] tracking-wider font-semibold block">
                      ESTIMATED RATE
                    </span>
                    <span className="font-extrabold text-slate-900 text-base font-mono-numbers">
                      ₹{estimatedPrice} ({durationHours} hrs × ₹{hourlyRate}/hr)
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase text-[10px] tracking-wider font-semibold block">
                      RESERVATION STATUS
                    </span>
                    <span className="font-bold text-emerald-700 text-xs flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Direct Confirmation
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500">
                  Instant smart slot assignment. Your QR ticket will be generated immediately.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={isSubmitting}
            className="py-2.5 px-4 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 2 ? 'Cancel' : 'Previous'}
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className="py-2.5 px-6 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleConfirmBooking}
              disabled={isSubmitting || availableSlots.length === 0}
              className="py-3 px-8 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Allocating Slot & Generating Ticket...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  Confirm Booking & Generate QR Ticket
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
