import { ParkingFacility, ParkingSlot, Booking, GateEvent } from '../types';

export const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getMaxDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear() + 1;
  return `${year}-12-31`;
};

export const PROTOTYPE_FACILITIES: ParkingFacility[] = [
  {
    id: 'fac-cmr-maddilapalem',
    name: 'CMR Central Maddilapalem Parking',
    area: 'Maddilapalem, Visakhapatnam',
    distance: '0.5 km from Maddilapalem Bus Station · Demo estimate',
    totalCapacity: 70,
    pricePerHour: 30,
    operatingHours: '09:00 AM – 10:30 PM',
    supportedVehicles: ['Car', 'Motorcycle'],
    amenities: [
      'CCTV — Prototype',
      'EV charging — Prototype',
      'Multi-level structure — Prototype',
      'Accessible parking — Prototype',
      'Security monitoring — Prototype'
    ],
    imagePath: '/src/assets/images/rk_beach_parking_1790580624734.jpg',
    description: 'Modern multi-level retail and commercial parking facility at Maddilapalem CMR Central hub with automated barrier control and bay sensors.',
    lat: 17.7385,
    lng: 83.3195,
    keywords: ['cmr', 'cmr central', 'maddilapalem', 'mall', 'shopping', 'nh16', 'bus stop', 'retail']
  },
  {
    id: 'fac-cmr-gajuwaka',
    name: 'CMR Central Gajuwaka Parking',
    area: 'Gajuwaka Commercial Zone, Visakhapatnam',
    distance: '1.2 km from Gajuwaka Junction · Demo estimate',
    totalCapacity: 60,
    pricePerHour: 30,
    operatingHours: '09:30 AM – 10:00 PM',
    supportedVehicles: ['Car', 'Motorcycle'],
    amenities: [
      'CCTV — Prototype',
      'Covered parking — Prototype',
      'EV charging — Prototype',
      'Security monitoring — Prototype'
    ],
    imagePath: '/src/assets/images/kailasagiri_parking_1790580638107.jpg',
    description: 'High-capacity shopping precinct parking facility serving Gajuwaka retail hub and industrial zone commuters.',
    lat: 17.6900,
    lng: 83.2185,
    keywords: ['cmr', 'cmr central', 'gajuwaka', 'gajuwaka junction', 'shopping', 'industrial', 'market']
  },
  {
    id: 'fac-inorbit',
    name: 'Inorbit Mall Parking',
    area: 'Kailasapuram, Visakhapatnam',
    distance: '2.5 km from Port Road · Demo estimate',
    totalCapacity: 85,
    pricePerHour: 30,
    operatingHours: '09:00 AM – 11:00 PM',
    supportedVehicles: ['Car', 'Motorcycle'],
    amenities: [
      'CCTV — Prototype',
      'High-speed EV charging — Prototype',
      'Multi-level structure — Prototype',
      'Automated guidance — Prototype',
      'Valet service — Prototype'
    ],
    imagePath: '/src/assets/images/hero_vizag_smartpark_1790580611665.jpg',
    description: 'Premium multi-tier destination mall parking facility with automated ticketless QR entry and real-time guidance.',
    lat: 17.7180,
    lng: 83.2790,
    keywords: ['inorbit', 'inorbit mall', 'kailasapuram', 'shopping', 'entertainment', 'cinema', 'multiplex']
  }
];

export const generateInitialSlots = (): ParkingSlot[] => {
  const slots: ParkingSlot[] = [];

  PROTOTYPE_FACILITIES.forEach((facility) => {
    const prefix = facility.id === 'fac-cmr-maddilapalem' ? 'M' :
                   facility.id === 'fac-cmr-gajuwaka' ? 'G' : 'I';

    for (let i = 1; i <= facility.totalCapacity; i++) {
      const numStr = i < 10 ? `0${i}` : `${i}`;
      const slotNum = `${prefix}-${numStr}`;
      
      // Determine slot type
      let type: 'Standard' | 'EV Charging' | 'Accessible' = 'Standard';
      if (i === 1 || i === 2) type = 'Accessible';
      else if (i === 3 || i === 4 || i === 5) type = 'EV Charging';

      slots.push({
        id: `slot-${facility.id}-${slotNum}`,
        facilityId: facility.id,
        slotNumber: slotNum,
        zone: i <= 35 ? 'Zone A (Main Mall)' : 'Zone B (Annex Deck)',
        type,
        state: 'AVAILABLE',
        currentBookingId: undefined,
        currentVehicleNumber: undefined,
        occupiedAt: undefined
      });
    }
  });

  return slots;
};

export const INITIAL_BOOKINGS: Booking[] = [];

export const INITIAL_GATE_EVENTS: GateEvent[] = [];
