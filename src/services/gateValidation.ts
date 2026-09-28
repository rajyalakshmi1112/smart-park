import { Booking, GateEvent } from '../types';
import { storageService } from './storage';

export interface GateValidationResult {
  isValid: boolean;
  reason?: string;
  booking?: Booking;
}

/**
 * Validates a booking ticket at the entry gate.
 * Optional bypassTimeWindow allows easy manual prototype demonstration if current time differs.
 */
export const validateEntryGateTicket = (
  ticketOrBookingId: string,
  facilityId: string,
  bypassTimeWindow: boolean = true
): GateValidationResult => {
  const cleanId = ticketOrBookingId.trim();
  if (!cleanId) {
    return {
      isValid: false,
      reason: 'No QR code or booking identifier provided.'
    };
  }

  const booking = storageService.getBooking(cleanId);

  // 1. Booking exists
  if (!booking) {
    storageService.addGateEvent({
      facilityId,
      facilityName: storageService.getFacility(facilityId)?.name || 'Gate Facility',
      bookingId: cleanId,
      type: 'ENTRY_DENIED',
      reason: 'Invalid booking identifier — Record not found',
      gateType: 'ENTRY'
    });
    return {
      isValid: false,
      reason: 'Invalid booking: Record not found in system.'
    };
  }

  // 2. Booking belongs to this parking facility
  if (booking.facilityId !== facilityId) {
    storageService.addGateEvent({
      facilityId,
      facilityName: storageService.getFacility(facilityId)?.name || 'Gate Facility',
      bookingId: booking.id,
      slotNumber: booking.slotNumber,
      vehicleNumber: booking.vehicleNumber,
      type: 'ENTRY_DENIED',
      reason: `Wrong parking location (Booked for: ${booking.facilityName})`,
      gateType: 'ENTRY'
    });
    return {
      isValid: false,
      reason: `Wrong parking facility. This reservation is for ${booking.facilityName}.`,
      booking
    };
  }

  // 3. Check status
  if (booking.status === 'CHECKED_IN') {
    storageService.addGateEvent({
      facilityId,
      facilityName: booking.facilityName,
      bookingId: booking.id,
      slotNumber: booking.slotNumber,
      vehicleNumber: booking.vehicleNumber,
      type: 'ENTRY_DENIED',
      reason: 'Ticket already used — Vehicle currently inside facility',
      gateType: 'ENTRY'
    });
    return {
      isValid: false,
      reason: 'Ticket already used: Vehicle is currently marked as checked-in.',
      booking
    };
  }

  if (booking.status === 'COMPLETED') {
    storageService.addGateEvent({
      facilityId,
      facilityName: booking.facilityName,
      bookingId: booking.id,
      slotNumber: booking.slotNumber,
      vehicleNumber: booking.vehicleNumber,
      type: 'ENTRY_DENIED',
      reason: 'Booking already completed and archived',
      gateType: 'ENTRY'
    });
    return {
      isValid: false,
      reason: 'Booking has already been completed and exited.',
      booking
    };
  }

  if (booking.status === 'CANCELLED') {
    storageService.addGateEvent({
      facilityId,
      facilityName: booking.facilityName,
      bookingId: booking.id,
      slotNumber: booking.slotNumber,
      vehicleNumber: booking.vehicleNumber,
      type: 'ENTRY_DENIED',
      reason: 'Booking was previously cancelled',
      gateType: 'ENTRY'
    });
    return {
      isValid: false,
      reason: 'Booking was cancelled. Entry cannot be permitted.',
      booking
    };
  }

  if (booking.status === 'NO_SHOW') {
    storageService.addGateEvent({
      facilityId,
      facilityName: booking.facilityName,
      bookingId: booking.id,
      slotNumber: booking.slotNumber,
      vehicleNumber: booking.vehicleNumber,
      type: 'ENTRY_DENIED',
      reason: 'Booking expired due to no-show arrival window lapse',
      gateType: 'ENTRY'
    });
    return {
      isValid: false,
      reason: 'Booking expired: Arrival grace period lapsed (marked as No-Show).',
      booking
    };
  }

  // 4. Validate time window if not bypassed
  if (!bypassTimeWindow) {
    // In prototype testing, users may simulate at any time; if strict mode enabled, check date
    const today = new Date().toISOString().split('T')[0];
    if (booking.date !== today) {
      return {
        isValid: false,
        reason: `Outside permitted entry window. Booking date is ${booking.date}.`,
        booking
      };
    }
  }

  return {
    isValid: true,
    booking
  };
};

/**
 * Executes confirmed check-in upon valid gate entry:
 * - Updates booking status to CHECKED_IN
 * - Updates slot status to OCCUPIED
 * - Records gate event
 */
export const executeGateEntryCheckIn = (booking: Booking): { success: boolean; event: GateEvent } => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  // Update booking
  storageService.updateBookingStatus(booking.id, 'CHECKED_IN', {
    checkedInAt: timeStr
  });

  // Update slot to OCCUPIED
  const slot = storageService.getSlot(booking.slotId);
  if (slot) {
    storageService.updateSlot({
      ...slot,
      state: 'OCCUPIED',
      currentBookingId: booking.id,
      currentVehicleNumber: booking.vehicleNumber,
      occupiedAt: timeStr
    });
  }

  // Record gate event
  const event = storageService.addGateEvent({
    facilityId: booking.facilityId,
    facilityName: booking.facilityName,
    bookingId: booking.id,
    slotNumber: booking.slotNumber,
    vehicleNumber: booking.vehicleNumber,
    type: 'ENTRY_ALLOWED',
    reason: `Automated QR verified. Slot ${booking.slotNumber} assigned.`,
    gateType: 'ENTRY'
  });

  return { success: true, event };
};

/**
 * Validates and executes exit gate checkout:
 * - Updates booking status to COMPLETED
 * - Updates slot status to AVAILABLE
 * - Records exit event
 */
export const executeGateExit = (bookingId: string): { success: boolean; booking?: Booking; error?: string } => {
  const booking = storageService.getBooking(bookingId);
  if (!booking) {
    return { success: false, error: 'Booking not found.' };
  }

  if (booking.status !== 'CHECKED_IN') {
    return {
      success: false,
      error: `Vehicle is not currently checked in. Current status: ${booking.status}`
    };
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  // Update booking to COMPLETED
  const updatedBooking = storageService.updateBookingStatus(booking.id, 'COMPLETED', {
    completedAt: timeStr
  });

  // Release slot to AVAILABLE
  const slot = storageService.getSlot(booking.slotId);
  if (slot) {
    storageService.updateSlot({
      ...slot,
      state: 'AVAILABLE',
      currentBookingId: undefined,
      currentVehicleNumber: undefined,
      occupiedAt: undefined
    });
  }

  // Record exit gate event
  storageService.addGateEvent({
    facilityId: booking.facilityId,
    facilityName: booking.facilityName,
    bookingId: booking.id,
    slotNumber: booking.slotNumber,
    vehicleNumber: booking.vehicleNumber,
    type: 'EXIT_COMPLETED',
    reason: `Exit gate processed. Slot ${booking.slotNumber} released to AVAILABLE.`,
    gateType: 'EXIT'
  });

  return {
    success: true,
    booking: updatedBooking || booking
  };
};

/**
 * Handles no-show simulation:
 * Marks booking as NO_SHOW and releases slot from RESERVED to AVAILABLE.
 */
export const markBookingNoShow = (bookingId: string): { success: boolean; error?: string } => {
  const booking = storageService.getBooking(bookingId);
  if (!booking) {
    return { success: false, error: 'Booking not found.' };
  }

  if (booking.status !== 'CONFIRMED') {
    return {
      success: false,
      error: `Only CONFIRMED bookings can lapse to NO_SHOW. Current status: ${booking.status}`
    };
  }

  storageService.updateBookingStatus(booking.id, 'NO_SHOW');

  // Release slot
  const slot = storageService.getSlot(booking.slotId);
  if (slot) {
    storageService.updateSlot({
      ...slot,
      state: 'AVAILABLE',
      currentBookingId: undefined,
      currentVehicleNumber: undefined
    });
  }

  // Record event
  storageService.addGateEvent({
    facilityId: booking.facilityId,
    facilityName: booking.facilityName,
    bookingId: booking.id,
    slotNumber: booking.slotNumber,
    vehicleNumber: booking.vehicleNumber,
    type: 'NO_SHOW_RELEASED',
    reason: `Arrival window lapsed. Slot ${booking.slotNumber} released.`,
    gateType: 'ENTRY'
  });

  return { success: true };
};
