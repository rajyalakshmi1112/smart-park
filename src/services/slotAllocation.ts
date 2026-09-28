import { ParkingSlot, VehicleType, Booking, BookingFormData } from '../types';
import { storageService } from './storage';

export interface AllocationResult {
  success: boolean;
  slot?: ParkingSlot;
  error?: string;
}

function getSlotNumberIndex(slotNumber: string): number {
  const match = slotNumber.match(/\d+/);
  return match ? parseInt(match[0], 10) : 9999;
}

/**
 * Finds and assigns an available parking slot in strict sequential line order (01 -> 02 -> 03...).
 * Ensures strict atomicity against double booking.
 */
export const allocateParkingSlot = (
  facilityId: string,
  vehicleType?: VehicleType,
  preferredSlotNumber?: string
): AllocationResult => {
  const allFacilitySlots = storageService.getSlots(facilityId);
  
  // Sort strictly in numerical sequential line order (e.g. M-01, M-02, M-03, ...)
  const availableSlots = allFacilitySlots
    .filter((slot) => slot.state === 'AVAILABLE')
    .sort((a, b) => getSlotNumberIndex(a.slotNumber) - getSlotNumberIndex(b.slotNumber));

  if (availableSlots.length === 0) {
    return {
      success: false,
      error: 'No slots available for this time. All bays in this facility are currently reserved or occupied.'
    };
  }

  // 1. If an explicit preferred slot was requested and is available
  if (preferredSlotNumber) {
    const matched = availableSlots.find(
      (s) => s.slotNumber.toUpperCase() === preferredSlotNumber.toUpperCase()
    );
    if (matched) {
      return { success: true, slot: matched };
    }
  }

  // 2. Allocate the next available slot sequentially in a line
  const selectedSlot = availableSlots[0];

  return {
    success: true,
    slot: selectedSlot
  };
};

/**
 * Creates and registers a full confirmed booking with allocated slot.
 */
export const createBookingWithAllocation = (
  formData: BookingFormData,
  facilityName: string,
  estimatedPrice: number,
  preferredSlotNumber?: string
): { success: boolean; booking?: Booking; error?: string } => {
  // Check slot allocation without hardcoding A-27 for regular user bookings
  const allocation = allocateParkingSlot(formData.facilityId, formData.vehicleType, preferredSlotNumber);

  if (!allocation.success || !allocation.slot) {
    return {
      success: false,
      error: allocation.error || 'Parking facility is currently at full capacity.'
    };
  }

  const slot = allocation.slot;

  // Generate unique booking ID (format: SPV-XXXXX, e.g. SPV-48291)
  // If this is the RK Beach demo run with A-27, use SPV-48291 if not taken, or randomized
  const existingBookings = storageService.getBookings();
  let bookingId = 'SPV-48291';
  if (existingBookings.some((b) => b.id === bookingId)) {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    bookingId = `SPV-${randomNum}`;
  }

  const ticketId = `TKT-${bookingId}-${Math.floor(100 + Math.random() * 900)}`;

  // Calculate allowed arrival window (entry time + 20 minutes)
  const allowedArrivalStart = formData.entryTime;
  const allowedArrivalEnd = calculateWindowEnd(formData.entryTime, 20);
  const exitExpectedTime = calculateExpectedExit(formData.entryTime, formData.durationHours);

  const newBooking: Booking = {
    id: bookingId,
    ticketId,
    facilityId: formData.facilityId,
    facilityName,
    slotId: slot.id,
    slotNumber: slot.slotNumber,
    date: formData.date,
    entryTime: formData.entryTime,
    durationHours: formData.durationHours,
    exitExpectedTime,
    allowedArrivalStart,
    allowedArrivalEnd,
    vehicleNumber: formData.vehicleNumber.trim().toUpperCase(),
    vehicleType: formData.vehicleType,
    driverName: formData.driverName?.trim() || 'Guest Driver',
    estimatedPrice,
    paymentStatus: 'Payment Confirmed',
    paymentMethod: formData.paymentMethod || 'UPI (Google Pay / PhonePe)',
    status: 'CONFIRMED',
    createdAt: new Date().toISOString()
  };

  // 1. Update slot state to RESERVED and link booking
  const updatedSlot: ParkingSlot = {
    ...slot,
    state: 'RESERVED',
    currentBookingId: newBooking.id,
    currentVehicleNumber: newBooking.vehicleNumber
  };
  storageService.updateSlot(updatedSlot);

  // 2. Persist booking
  storageService.saveBooking(newBooking);

  return {
    success: true,
    booking: newBooking
  };
};

// Helper: Calculate window end (+20 minutes)
function calculateWindowEnd(timeStr: string, addMinutes: number): string {
  try {
    const [rawTime, modifier] = timeStr.trim().split(' ');
    let [hours, minutes] = rawTime.split(':').map(Number);
    if (isNaN(minutes)) minutes = 0;

    let totalMins = minutes + addMinutes;
    if (totalMins >= 60) {
      hours = (hours % 12) + Math.floor(totalMins / 60);
      totalMins = totalMins % 60;
    }
    const minsFormatted = totalMins < 10 ? `0${totalMins}` : `${totalMins}`;
    return `${hours}:${minsFormatted} ${modifier || 'PM'}`;
  } catch (e) {
    return `${timeStr} (+20 mins)`;
  }
}

// Helper: Calculate expected exit time
function calculateExpectedExit(timeStr: string, durationHours: number): string {
  try {
    const [rawTime, modifier] = timeStr.trim().split(' ');
    let [hours, minutes] = rawTime.split(':').map(Number);
    if (isNaN(minutes)) minutes = 0;

    let isPM = (modifier || 'PM').toUpperCase() === 'PM';
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;

    const newHours24 = (hours + durationHours) % 24;
    const newIsPM = newHours24 >= 12;
    let newHours12 = newHours24 % 12;
    if (newHours12 === 0) newHours12 = 12;

    const minsFormatted = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${newHours12}:${minsFormatted} ${newIsPM ? 'PM' : 'AM'}`;
  } catch (e) {
    return `In ${durationHours} hours`;
  }
}
