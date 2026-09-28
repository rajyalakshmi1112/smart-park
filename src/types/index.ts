export type VehicleType = 'Car' | 'Motorcycle';

export type SlotState = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'MAINTENANCE' | 'RELEASED';

export type BookingStatus = 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export type GateEventType = 'ENTRY_ALLOWED' | 'ENTRY_DENIED' | 'EXIT_COMPLETED' | 'NO_SHOW_RELEASED';

export interface ParkingFacility {
  id: string;
  name: string;
  area: string;
  distance: string;
  totalCapacity: number;
  pricePerHour: number;
  operatingHours: string;
  supportedVehicles: VehicleType[];
  amenities: string[];
  imagePath: string;
  description: string;
  lat: number;
  lng: number;
  keywords: string[];
}

export interface ParkingSlot {
  id: string;
  facilityId: string;
  slotNumber: string; // e.g. A-01, A-27
  zone: string; // e.g. Zone A (Beachfront), Zone B (Covered)
  type: 'Standard' | 'EV Charging' | 'Accessible';
  state: SlotState;
  currentBookingId?: string;
  currentVehicleNumber?: string;
  occupiedAt?: string;
}

export interface Booking {
  id: string; // e.g. SPV-48291
  ticketId: string; // e.g. TKT-SPV-48291-742
  facilityId: string;
  facilityName: string;
  slotId: string;
  slotNumber: string; // e.g. A-27
  date: string; // YYYY-MM-DD or readable string
  entryTime: string; // e.g. 6:00 PM
  durationHours: number;
  exitExpectedTime: string;
  allowedArrivalStart: string; // 6:00 PM
  allowedArrivalEnd: string; // 6:20 PM
  vehicleNumber: string; // e.g. AP 31 XX 1234
  vehicleType: VehicleType;
  driverName?: string;
  estimatedPrice: number; // in INR
  paymentStatus: string;
  paymentMethod?: string; // e.g. 'UPI (Google Pay)', 'Visa Card', 'FASTag Auto-Debit', 'Net Banking'
  status: BookingStatus;
  createdAt: string;
  checkedInAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface GateEvent {
  id: string;
  timestamp: string;
  facilityId: string;
  facilityName: string;
  bookingId?: string;
  slotNumber?: string;
  vehicleNumber?: string;
  type: GateEventType;
  reason?: string;
  gateType: 'ENTRY' | 'EXIT';
}

export interface BookingFormData {
  facilityId: string;
  date: string;
  entryTime: string;
  durationHours: number;
  vehicleNumber: string;
  vehicleType: VehicleType;
  driverName?: string;
  paymentMethod?: string;
}
