import { BusLine, EmailRideRequest, Ride, RideType } from './types';

// Mock Bus Data for Ma'ale Amos
export const BUS_SCHEDULES: BusLine[] = [
  {
    line: "409",
    operator: "אלקטרה אפיקים",
    origin: "מעלה עמוס",
    destination: "ירושלים",
    schedule: ["06:00", "06:45", "07:30", "08:15", "09:00", "12:00", "14:30", "16:15", "18:00", "20:30", "22:15"]
  },
  {
    line: "409",
    operator: "אלקטרה אפיקים",
    origin: "ירושלים",
    destination: "מעלה עמוס",
    schedule: ["08:00", "10:00", "13:00", "15:00", "17:00", "19:00", "23:00"]
  },
  {
    line: "365",
    operator: "אלקטרה אפיקים",
    origin: "מעלה עמוס",
    destination: "מיצד",
    schedule: ["08:30", "12:30", "16:30"]
  }
];

export const MOCK_RIDES: Ride[] = [
  {
    id: '1',
    userId: 'user-other',
    type: RideType.OFFER,
    driverName: 'יוסי כהן',
    origin: 'מעלה עמוס',
    destination: 'ירושלים',
    time: '07:45',
    seats: 3,
    phone: '0501234567',
    date: new Date().toISOString().split('T')[0],
    isRecurring: true,
    recurringDays: [0, 1, 2, 3, 4], // Sun-Thu
    notes: 'יוצא מהשער, מגיע עד בנייני האומה'
  },
  {
    id: '2',
    userId: 'user-me', 
    type: RideType.OFFER,
    driverName: 'אני (דוד לוי)',
    origin: 'מעלה עמוס',
    destination: 'ביתר עילית',
    time: '08:10',
    seats: 4,
    phone: '0529876543',
    date: new Date().toISOString().split('T')[0],
    notes: 'תא מטען פנוי'
  },
  {
    id: '3',
    userId: 'user-other',
    type: RideType.REQUEST,
    driverName: 'שרה אברהמי',
    origin: 'צומת הגוש',
    destination: 'מעלה עמוס',
    time: '16:00',
    seats: 1,
    phone: '0543332211',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: '4',
    userId: 'user-other',
    type: RideType.OFFER,
    driverName: 'משה זלמן',
    origin: 'מעלה עמוס',
    destination: 'בית שמש',
    time: '09:30',
    seats: 2,
    phone: '0587776655',
    date: new Date().toISOString().split('T')[0],
    notes: 'רק נשים בבקשה'
  },
  {
    id: '5',
    userId: 'user-me',
    type: RideType.OFFER,
    driverName: 'אני (אבי רון)',
    origin: 'מעלה עמוס',
    destination: 'מיצד',
    time: '18:30',
    seats: 3,
    phone: '0551112233',
    date: new Date().toISOString().split('T')[0],
    isRecurring: true,
    recurringDays: [4], // Thursdays only
    notes: 'נוסע לחברים'
  },
  {
    id: '6',
    userId: 'user-other',
    type: RideType.REQUEST,
    driverName: 'נחמן מאומן',
    origin: 'מיצד',
    destination: 'מעלה עמוס',
    time: '20:00',
    seats: 1,
    phone: '0500000000',
    date: new Date().toISOString().split('T')[0],
    notes: 'דחוף!'
  }
];

export const MOCK_EMAIL_REQUESTS: EmailRideRequest[] = [
  {
    id: 'e1',
    originalSubject: 'מחפשת טרמפ לירושלים מחר בבוקר',
    originalBody: 'היי, צריכה להגיע לגבעת שאול באזור 8 בבוקר. אם מישהו יוצא אשמח להצטרף. רחלי 050-9999999',
    senderName: 'רחלי כהן',
    senderEmail: 'racheli@gmail.com',
    detectedOrigin: 'מעלה עמוס',
    detectedDestination: 'ירושלים',
    detectedTime: '08:00',
    receivedAt: new Date().toISOString()
  },
  {
    id: 'e2',
    originalSubject: 'יוצא מביתר למעלה עמוס ב16:00',
    originalBody: 'יש 3 מקומות פנויים. חוזר דרך צומת הגוש.',
    senderName: 'דניאל',
    senderEmail: 'daniel@walla.co.il',
    detectedOrigin: 'ביתר עילית',
    detectedDestination: 'מעלה עמוס',
    detectedTime: '16:00',
    receivedAt: new Date(Date.now() - 3600000).toISOString()
  }
];