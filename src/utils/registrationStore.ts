import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  getDocs,
  where,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../services/firebase';

export type VerificationStatus = 'UNDER_SURVEILLANCE' | 'APPROVED' | 'REJECTED';

export interface StudentRegistration {
  id: string; // Internal record ID, e.g. "REG-2026-001"
  transactionId: string; // UPI UTR / Transaction ID submitted by student, e.g. "428901234567"
  fullName: string;
  email: string;
  phone: string;
  district: string;
  collegeName: string;
  prnRollNo: string;
  degree: string;
  branch: string;
  academicYear: string;
  idProofName?: string;
  idProofBase64?: string; // Student College ID / Allotment card proof stored in Firestore
  paymentScreenshotBase64?: string; // Uploaded UPI payment screenshot / receipt
  paymentScreenshotName?: string;
  ticketTier: string; // e.g. "Super Early Bird (₹149)", "Early Bird Ticket (₹249)"
  amount: number; // e.g. 149, 249, 349
  status: VerificationStatus;
  ticketCode?: string; // Generated upon approval, e.g. "TKT-2026-X9K2M4"
  bookingId: string; // Reference, e.g. "AWS-SCD-829104"
  rejectionReason?: string;
  verifiedAt?: string;
  checkedIn?: boolean; // Has this QR code been scanned at the gate?
  checkedInAt?: string; // Timestamp of check-in scan
  createdAt: string;
  updatedAt: string;
}

export interface CheckInResult {
  status: 'SUCCESS' | 'ALREADY_USED' | 'UNAPPROVED' | 'NOT_FOUND';
  message: string;
  registration?: StudentRegistration;
  scannedAt?: string;
}

/**
 * Compresses an image client-side to ensure lightweight storage
 */
export function compressImageToBase64(
  file: File,
  maxWidth = 900,
  maxHeight = 900,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

export const REGISTRATIONS_STORAGE_KEY = 'aws_scd_registrations_v2';

// Seed registrations for initial administrative review
const SEED_REGISTRATIONS: StudentRegistration[] = [
  {
    id: 'REG-2026-001',
    transactionId: '428901234567',
    fullName: 'Rohan Sharma',
    email: 'rohan.sharma@gcoek.ac.in',
    phone: '+91 9823456781',
    district: 'Kolhapur',
    collegeName: 'Government College of Engineering Karad (GCOEK)',
    prnRollNo: '2201045',
    degree: 'B.Tech / B.E.',
    branch: 'Computer Science & Engineering (CSE)',
    academicYear: '3rd Yr',
    idProofName: 'rohan_college_id.png',
    ticketTier: 'Super Early Bird Ticket',
    amount: 149,
    status: 'UNDER_SURVEILLANCE',
    bookingId: 'AWS-SCD-829104',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'REG-2026-002',
    transactionId: '429188402911',
    fullName: 'Ananya Patil',
    email: 'ananya.patil@kitcoek.in',
    phone: '+91 9890123456',
    district: 'Kolhapur',
    collegeName: "KIT's College of Engineering (Autonomous), Kolhapur",
    prnRollNo: 'KIT-2023-CS-088',
    degree: 'B.Tech / B.E.',
    branch: 'Artificial Intelligence & Data Science (AI & DS)',
    academicYear: '2nd Yr',
    idProofName: 'ananya_id_proof.jpg',
    ticketTier: 'Early Bird Ticket',
    amount: 249,
    status: 'APPROVED',
    ticketCode: 'TKT-2026-K9M2P1',
    bookingId: 'AWS-SCD-719302',
    verifiedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

export function loadRegistrations(): StudentRegistration[] {
  if (typeof window === 'undefined') return SEED_REGISTRATIONS;
  try {
    const raw = localStorage.getItem(REGISTRATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(SEED_REGISTRATIONS));
      return SEED_REGISTRATIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (err) {
    console.error('Failed to load registrations from localStorage:', err);
  }
  return SEED_REGISTRATIONS;
}

export function saveRegistrations(records: StudentRegistration[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent('registrationsUpdated', { detail: records }));
}

/**
 * Real-time subscription to Firebase Firestore registrations collection.
 * When Firestore changes, updates localStorage and triggers listeners.
 */
export function subscribeToRegistrations(callback: (records: StudentRegistration[]) => void): () => void {
  // If Firebase is configured, listen to Firestore in real-time
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, 'registrations'), orderBy('createdAt', 'desc'));
      const unsubscribe: Unsubscribe = onSnapshot(
        q,
        snapshot => {
          const remoteRecords: StudentRegistration[] = [];
          snapshot.forEach(docSnap => {
            remoteRecords.push(docSnap.data() as StudentRegistration);
          });
          if (remoteRecords.length > 0) {
            saveRegistrations(remoteRecords);
            callback(remoteRecords);
          } else {
            callback(loadRegistrations());
          }
        },
        error => {
          console.warn('Firestore onSnapshot listener error, falling back to local storage:', error);
          callback(loadRegistrations());
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('Error setting up Firestore listener:', err);
    }
  }

  // Local fallback subscription
  const handleUpdate = () => callback(loadRegistrations());
  window.addEventListener('registrationsUpdated', handleUpdate);
  window.addEventListener('storage', handleUpdate);
  callback(loadRegistrations());

  return () => {
    window.removeEventListener('registrationsUpdated', handleUpdate);
    window.removeEventListener('storage', handleUpdate);
  };
}

export function submitNewRegistration(
  data: Omit<
    StudentRegistration,
    'id' | 'status' | 'bookingId' | 'ticketCode' | 'createdAt' | 'updatedAt'
  >
): StudentRegistration {
  const current = loadRegistrations();

  const generatedId = 'REG-' + Math.floor(100000 + Math.random() * 900000);
  const generatedBookingId = 'AWS-SCD-' + Math.floor(100000 + Math.random() * 900000);

  const newRecord: StudentRegistration = {
    ...data,
    id: generatedId,
    bookingId: generatedBookingId,
    status: 'UNDER_SURVEILLANCE', // All new registrations go under surveillance for admin verification
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [newRecord, ...current];
  saveRegistrations(updated);

  // Sync to Firebase Firestore asynchronously if configured
  if (isFirebaseConfigured() && db) {
    setDoc(doc(db, 'registrations', newRecord.id), newRecord).catch(err => {
      console.error('Error saving registration to Firestore:', err);
    });
  }

  return newRecord;
}

export function updateRegistrationStatus(
  id: string,
  newStatus: VerificationStatus,
  rejectionReason?: string
): StudentRegistration | null {
  const current = loadRegistrations();
  const index = current.findIndex(r => r.id === id);
  if (index === -1) return null;

  const target = current[index];
  const updatedRecord: StudentRegistration = {
    ...target,
    status: newStatus,
    rejectionReason: newStatus === 'REJECTED' ? rejectionReason || 'Transaction could not be verified' : undefined,
    // Generate official ticket pass code on approval
    ticketCode:
      newStatus === 'APPROVED'
        ? target.ticketCode || 'TKT-2026-' + Math.random().toString(36).substring(2, 8).toUpperCase()
        : target.ticketCode,
    verifiedAt: newStatus === 'APPROVED' ? new Date().toISOString() : undefined,
    updatedAt: new Date().toISOString(),
  };

  current[index] = updatedRecord;
  saveRegistrations(current);

  // Sync update to Firebase Firestore
  if (isFirebaseConfigured() && db) {
    updateDoc(doc(db, 'registrations', id), {
      status: updatedRecord.status,
      rejectionReason: updatedRecord.rejectionReason || null,
      ticketCode: updatedRecord.ticketCode || null,
      verifiedAt: updatedRecord.verifiedAt || null,
      updatedAt: updatedRecord.updatedAt,
    }).catch(err => {
      console.error('Error updating status in Firestore:', err);
    });
  }

  return updatedRecord;
}

export function deleteRegistration(id: string): void {
  const current = loadRegistrations();
  const filtered = current.filter(r => r.id !== id);
  saveRegistrations(filtered);

  if (isFirebaseConfigured() && db) {
    deleteDoc(doc(db, 'registrations', id)).catch(err => {
      console.error('Error deleting document from Firestore:', err);
    });
  }
}

export function findRegistration(queryStr: string): StudentRegistration | null {
  const current = loadRegistrations();
  const q = queryStr.trim().toLowerCase();
  if (!q) return null;

  return (
    current.find(
      r =>
        r.transactionId.toLowerCase() === q ||
        r.bookingId.toLowerCase() === q ||
        r.email.toLowerCase() === q ||
        r.prnRollNo.toLowerCase() === q ||
        (r.ticketCode && r.ticketCode.toLowerCase() === q)
    ) || null
  );
}

/**
 * Async lookup for student ticket status tracking (queries Firestore directly if connected)
 */
export async function findRegistrationAsync(queryStr: string): Promise<StudentRegistration | null> {
  const localMatch = findRegistration(queryStr);
  const q = queryStr.trim();
  if (!q) return null;

  if (isFirebaseConfigured() && db) {
    try {
      // 1. Try finding by transactionId
      const qTx = query(collection(db, 'registrations'), where('transactionId', '==', q));
      const txSnap = await getDocs(qTx);
      if (!txSnap.empty) {
        return txSnap.docs[0].data() as StudentRegistration;
      }

      // 2. Try finding by email
      const qEmail = query(collection(db, 'registrations'), where('email', '==', q.toLowerCase()));
      const emailSnap = await getDocs(qEmail);
      if (!emailSnap.empty) {
        return emailSnap.docs[0].data() as StudentRegistration;
      }

      // 3. Try finding by bookingId
      const qBooking = query(collection(db, 'registrations'), where('bookingId', '==', q.toUpperCase()));
      const bookingSnap = await getDocs(qBooking);
      if (!bookingSnap.empty) {
        return bookingSnap.docs[0].data() as StudentRegistration;
      }
    } catch (err) {
      console.warn('Error querying Firestore for ticket status:', err);
    }
  }

  return localMatch;
}

export function exportRegistrationsToCSV(records: StudentRegistration[]): void {
  const headers = [
    'ID',
    'Transaction ID / UTR',
    'Full Name',
    'Email',
    'Phone',
    'District',
    'College',
    'PRN / Roll No',
    'Degree',
    'Branch',
    'Year',
    'Tier',
    'Amount (INR)',
    'Status',
    'Ticket Pass Code',
    'Booking ID',
    'Submitted At',
  ];

  const rows = records.map(r => [
    r.id,
    r.transactionId,
    `"${r.fullName.replace(/"/g, '""')}"`,
    r.email,
    r.phone,
    r.district,
    `"${r.collegeName.replace(/"/g, '""')}"`,
    r.prnRollNo,
    r.degree,
    r.branch,
    r.academicYear,
    `"${r.ticketTier}"`,
    r.amount,
    r.status,
    r.ticketCode || 'N/A',
    r.bookingId,
    r.createdAt,
  ]);

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `aws_scd_registrations_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Gate Check-In: Scans a ticket QR code.
 * Ensures each QR code can only be scanned ONCE.
 */
export function checkInTicket(rawCode: string): CheckInResult {
  const current = loadRegistrations();

  // Strip prefixes if scanned from URL or JSON payload
  let cleanCode = rawCode.trim();
  if (cleanCode.includes('|')) {
    const parts = cleanCode.split('|');
    cleanCode = parts[1] || parts[0];
  } else if (cleanCode.includes('ticket=')) {
    cleanCode = cleanCode.split('ticket=')[1].split('&')[0];
  }
  const q = cleanCode.toLowerCase();

  const matchIndex = current.findIndex(
    r =>
      (r.ticketCode && r.ticketCode.toLowerCase() === q) ||
      r.bookingId.toLowerCase() === q ||
      r.transactionId.toLowerCase() === q
  );

  if (matchIndex === -1) {
    return {
      status: 'NOT_FOUND',
      message: `Invalid Ticket Code: "${cleanCode}". Not found in registration database.`,
    };
  }

  const record = current[matchIndex];

  // Must be verified & approved by admin first
  if (record.status !== 'APPROVED') {
    return {
      status: 'UNAPPROVED',
      message: `Ticket exists for ${record.fullName}, but status is "${record.status}". Not approved by admin.`,
      registration: record,
    };
  }

  // ALREADY USED CHECK: Strict 1-time scan enforcement
  if (record.checkedIn) {
    const timeStr = record.checkedInAt
      ? new Date(record.checkedInAt).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      : 'Earlier';

    return {
      status: 'ALREADY_USED',
      message: `⚠️ DUPLICATE ENTRY BLOCKED! This ticket was already checked in at ${timeStr}. Each ticket can only be scanned once!`,
      registration: record,
      scannedAt: record.checkedInAt,
    };
  }

  // FIRST SCAN: Mark as checked-in
  const updatedRecord: StudentRegistration = {
    ...record,
    checkedIn: true,
    checkedInAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  current[matchIndex] = updatedRecord;
  saveRegistrations(current);

  // Sync check-in to Firestore
  if (isFirebaseConfigured() && db) {
    updateDoc(doc(db, 'registrations', updatedRecord.id), {
      checkedIn: true,
      checkedInAt: updatedRecord.checkedInAt,
      updatedAt: updatedRecord.updatedAt,
    }).catch(err => {
      console.error('Error syncing check-in to Firestore:', err);
    });
  }

  return {
    status: 'SUCCESS',
    message: `✓ ACCESS GRANTED! Welcome to AWS SCD 2026, ${record.fullName}.`,
    registration: updatedRecord,
    scannedAt: updatedRecord.checkedInAt,
  };
}

/**
 * Resets a ticket's check-in state in case of admin test or re-entry override
 */
export function resetTicketCheckIn(id: string): StudentRegistration | null {
  const current = loadRegistrations();
  const index = current.findIndex(r => r.id === id);
  if (index === -1) return null;

  const target = current[index];
  const updated: StudentRegistration = {
    ...target,
    checkedIn: false,
    checkedInAt: undefined,
    updatedAt: new Date().toISOString(),
  };

  current[index] = updated;
  saveRegistrations(current);

  if (isFirebaseConfigured() && db) {
    updateDoc(doc(db, 'registrations', id), {
      checkedIn: false,
      checkedInAt: null,
      updatedAt: updated.updatedAt,
    }).catch(err => console.error(err));
  }

  return updated;
}

