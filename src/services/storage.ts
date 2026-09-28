import { ParkingFacility, ParkingSlot, Booking, GateEvent } from '../types';
import { PROTOTYPE_FACILITIES, generateInitialSlots, INITIAL_BOOKINGS, INITIAL_GATE_EVENTS } from '../data/mockSeed';

const STORAGE_KEYS = {
  FACILITIES: 'spv_facilities_v6',
  SLOTS: 'spv_slots_v6',
  BOOKINGS: 'spv_bookings_v6',
  GATE_EVENTS: 'spv_gate_events_v6'
};

type Listener = () => void;
const listeners: Set<Listener> = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error in storage listener', e);
    }
  });
};

export const subscribeToStorage = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

class ParkingStorageService {
  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (typeof window === 'undefined') return;

    // Purge legacy storage keys with old demo data
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('spv_') && !Object.values(STORAGE_KEYS).includes(key)) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      // ignore
    }

    const storedFacilities = localStorage.getItem(STORAGE_KEYS.FACILITIES);
    let isStale = false;

    if (storedFacilities) {
      try {
        const parsed: any[] = JSON.parse(storedFacilities);
        const validIds = new Set(PROTOTYPE_FACILITIES.map((p) => p.id));
        const hasInvalidIds = parsed.some((f) => !validIds.has(f.id));
        const lengthMismatch = parsed.length !== PROTOTYPE_FACILITIES.length;
        if (hasInvalidIds || lengthMismatch) {
          isStale = true;
        }
      } catch {
        isStale = true;
      }
    } else {
      isStale = true;
    }

    if (isStale) {
      this.resetToDefaults();
    }
  }

  public getFacilities(): ParkingFacility[] {
    this.ensureInitialized();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FACILITIES);
      if (!data) return PROTOTYPE_FACILITIES;
      const parsed: any[] = JSON.parse(data);
      return parsed.map((fac) => {
        const proto = PROTOTYPE_FACILITIES.find((p) => p.id === fac.id);
        return {
          ...proto,
          ...fac,
          lat: typeof fac.lat === 'number' && !isNaN(fac.lat) ? fac.lat : (proto?.lat ?? 17.729),
          lng: typeof fac.lng === 'number' && !isNaN(fac.lng) ? fac.lng : (proto?.lng ?? 83.320),
          keywords: fac.keywords || proto?.keywords || []
        } as ParkingFacility;
      });
    } catch (e) {
      return PROTOTYPE_FACILITIES;
    }
  }

  public getFacility(id: string): ParkingFacility | undefined {
    return this.getFacilities().find((f) => f.id === id);
  }

  public getSlots(facilityId?: string): ParkingSlot[] {
    this.ensureInitialized();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SLOTS);
      const slots: ParkingSlot[] = data ? JSON.parse(data) : generateInitialSlots();
      return facilityId ? slots.filter((s) => s.facilityId === facilityId) : slots;
    } catch (e) {
      return generateInitialSlots();
    }
  }

  public getSlot(slotId: string): ParkingSlot | undefined {
    return this.getSlots().find((s) => s.id === slotId);
  }

  public updateSlot(updatedSlot: ParkingSlot): void {
    const slots = this.getSlots();
    const index = slots.findIndex((s) => s.id === updatedSlot.id);
    if (index !== -1) {
      slots[index] = updatedSlot;
      localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
      notifyListeners();
    }
  }

  public batchUpdateSlots(updatedSlots: ParkingSlot[]): void {
    const slotsMap = new Map(this.getSlots().map((s) => [s.id, s]));
    updatedSlots.forEach((s) => slotsMap.set(s.id, s));
    localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(Array.from(slotsMap.values())));
    notifyListeners();
  }

  public getBookings(): Booking[] {
    this.ensureInitialized();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      return data ? JSON.parse(data) : INITIAL_BOOKINGS;
    } catch (e) {
      return INITIAL_BOOKINGS;
    }
  }

  public getBooking(bookingIdOrTicketId: string): Booking | undefined {
    const cleaned = bookingIdOrTicketId.trim().toUpperCase();
    return this.getBookings().find(
      (b) => b.id.toUpperCase() === cleaned || b.ticketId.toUpperCase() === cleaned
    );
  }

  public saveBooking(booking: Booking): void {
    const bookings = this.getBookings();
    const index = bookings.findIndex((b) => b.id === booking.id);
    if (index !== -1) {
      bookings[index] = booking;
    } else {
      bookings.unshift(booking);
    }
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    notifyListeners();
  }

  public updateBookingStatus(
    bookingId: string,
    status: Booking['status'],
    extras?: Partial<Booking>
  ): Booking | null {
    const bookings = this.getBookings();
    const index = bookings.findIndex((b) => b.id === bookingId);
    if (index === -1) return null;

    bookings[index] = {
      ...bookings[index],
      status,
      ...extras
    };

    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    notifyListeners();
    return bookings[index];
  }

  public getGateEvents(): GateEvent[] {
    this.ensureInitialized();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GATE_EVENTS);
      return data ? JSON.parse(data) : INITIAL_GATE_EVENTS;
    } catch (e) {
      return INITIAL_GATE_EVENTS;
    }
  }

  public addGateEvent(event: Omit<GateEvent, 'id' | 'timestamp'>): GateEvent {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const newEvent: GateEvent = {
      ...event,
      id: `gev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: timeStr
    };

    const events = this.getGateEvents();
    events.unshift(newEvent);
    // Keep last 100 events
    if (events.length > 100) events.pop();

    localStorage.setItem(STORAGE_KEYS.GATE_EVENTS, JSON.stringify(events));
    notifyListeners();
    return newEvent;
  }

  public clearFilledAndReservedSlots(facilityId?: string): number {
    const slots = this.getSlots();
    let count = 0;
    const updatedSlots = slots.map((slot) => {
      if (facilityId && facilityId !== 'ALL' && slot.facilityId !== facilityId) return slot;
      if (slot.state === 'OCCUPIED' || slot.state === 'RESERVED') {
        count++;
        return {
          ...slot,
          state: 'AVAILABLE' as const,
          currentBookingId: undefined,
          currentVehicleNumber: undefined,
          occupiedAt: undefined
        };
      }
      return slot;
    });

    localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(updatedSlots));

    // Also clear all demo bookings and gate events when clearing all bays
    if (!facilityId || facilityId === 'ALL') {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.GATE_EVENTS, JSON.stringify([]));
    } else {
      const bookings = this.getBookings();
      const updatedBookings = bookings.filter((b) => b.facilityId !== facilityId);
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updatedBookings));
    }

    notifyListeners();
    return count;
  }

  public resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(PROTOTYPE_FACILITIES));
    localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(generateInitialSlots()));
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
    localStorage.setItem(STORAGE_KEYS.GATE_EVENTS, JSON.stringify(INITIAL_GATE_EVENTS));
    notifyListeners();
  }
}

export const storageService = new ParkingStorageService();
