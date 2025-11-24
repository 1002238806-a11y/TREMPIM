
export enum RideType {
  OFFER = 'offer',   // Driver offering a ride
  REQUEST = 'request' // Passenger looking for a ride
}

export interface User {
  id: string;
  name: string;
  email?: string; // Optional now
  imageUrl?: string;
  isAdmin?: boolean; // New flag for local admin state
}

export interface Ride {
  id: string;
  userId: string; 
  user?: User; 
  type: RideType;
  driverName: string;
  origin: string;
  destination: string;
  time: string; // HH:mm format
  seats: number;
  phone: string;
  isRecurring?: boolean;
  recurringDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  notes?: string;
  date: string; // YYYY-MM-DD
}

export interface EmailRideRequest {
  id: string;
  originalSubject: string;
  originalBody: string;
  senderName: string;
  senderEmail: string;
  detectedOrigin: string;
  detectedDestination: string;
  detectedTime?: string;
  receivedAt: string; // ISO String
}

export interface BusLine {
  line: string;
  origin: string;
  destination: string;
  schedule: string[]; // Array of HH:mm strings
  operator: string;
}

export interface CombinedTransportItem {
  id: string;
  type: 'ride' | 'bus';
  data: Ride | { line: BusLine; departureTime: string };
  sortTime: string; // HH:mm for sorting
}

export const DESTINATIONS = [
  "ירושלים",
  "ביתר עילית",
  "בית שמש",
  "צומת הגוש",
  "הגבעה הצהובה",
  "קריית ארבע",
  "אפרת",
  "מיצד",
  "תקוע"
] as const;

export type Destination = typeof DESTINATIONS[number] | string;
