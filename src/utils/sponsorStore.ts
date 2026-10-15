import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../services/firebase';

export type SponsorStatus = 'PENDING' | 'CONTACTED' | 'CONFIRMED' | 'DECLINED';

export interface SponsorApplication {
  id: string; // e.g. "SPN-2026-X821"
  company: string;
  contactName: string;
  email: string;
  phone: string;
  website?: string;
  industry: string;
  tier: string; // e.g. "Title Sponsor", "Gold Sponsor"
  price: string; // e.g. "₹75,000"
  companyPhotoBase64?: string; // Photo of shop, showroom, stall or logo
  showcaseInterests: string[]; // e.g. ["Expo Stall", "Keynote Slot", "Swag Distribution"]
  customShowcase?: string; // What they want to show/promote
  details: string; // Additional message or proposal notes
  status: SponsorStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const SPONSORS_STORAGE_KEY = 'aws_scd_sponsors_v1';

// Seed demo sponsors if empty so the admin panel has rich preview data
export const INITIAL_DEMO_SPONSORS: SponsorApplication[] = [
  {
    id: 'SPN-2026-9021',
    company: 'CloudSphere Technologies',
    contactName: 'Rohit Kulkarni',
    email: 'rohit@cloudsphere.io',
    phone: '+91 98220 12345',
    website: 'https://cloudsphere.io',
    industry: 'Cloud Infrastructure & DevOps',
    tier: 'Title Sponsor',
    price: '₹75,000',
    showcaseInterests: ['Product Expo Stall & Booth', 'Speaking Slot / Keynote Tech Demo', 'Logo on Stage Backdrop & Banners', 'Direct Student Talent Hiring & Internships'],
    customShowcase: 'We want to demonstrate our multi-cloud deployment automation platform and recruit 4 cloud engineer interns from Kolhapur region.',
    details: 'Excited to sponsor Western Maharashtra’s biggest student cloud conference. Need premium booth location near entrance.',
    status: 'CONTACTED',
    createdAt: '2026-10-14T10:30:00.000Z',
    updatedAt: '2026-10-15T12:00:00.000Z',
  },
  {
    id: 'SPN-2026-4412',
    company: 'Apex DevWorks',
    contactName: 'Snehal Patil',
    email: 'snehal@apexdevworks.com',
    phone: '+91 94230 88765',
    website: 'https://apexdevworks.com',
    industry: 'Software & EdTech',
    tier: 'Gold Sponsor',
    price: '₹40,000',
    showcaseInterests: ['Product Expo Stall & Booth', 'Distribute Goodies / Swag / Kits', 'Student Pass Lanyards & Badges Branding'],
    customShowcase: 'We want to distribute branded sticker packs, t-shirts, and introduce our student coding fellowship program.',
    details: 'Looking forward to engaging with 400+ student attendees. Requesting stall power outlet for dual-monitor demos.',
    status: 'PENDING',
    createdAt: '2026-10-15T16:20:00.000Z',
    updatedAt: '2026-10-15T16:20:00.000Z',
  },
];

/**
 * Strips all `undefined` values recursively so Firebase Firestore setDoc never throws.
 */
export function cleanForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = cleanForFirestore(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

/**
 * Normalizes a raw document snapshot into a strictly typed SponsorApplication.
 */
export function parseSponsorDoc(id: string, data: any): SponsorApplication {
  return {
    id: id || data?.id || `SPN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    company: data?.company || 'Unnamed Sponsor',
    contactName: data?.contactName || '',
    email: data?.email || '',
    phone: data?.phone || '',
    website: data?.website || '',
    industry: data?.industry || 'Technology & Software',
    tier: data?.tier || 'Silver Sponsor',
    price: data?.price || '₹10,000',
    companyPhotoBase64: data?.companyPhotoBase64 || undefined,
    showcaseInterests: Array.isArray(data?.showcaseInterests) ? data.showcaseInterests : [],
    customShowcase: data?.customShowcase || '',
    details: data?.details || '',
    status: (data?.status as SponsorStatus) || 'PENDING',
    notes: data?.notes || '',
    createdAt: data?.createdAt || new Date().toISOString(),
    updatedAt: data?.updatedAt || new Date().toISOString(),
  };
}

export function loadSponsors(): SponsorApplication[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_SPONSORS;
  try {
    const raw = localStorage.getItem(SPONSORS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SPONSORS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_SPONSORS));
      return INITIAL_DEMO_SPONSORS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DEMO_SPONSORS;
  } catch {
    return INITIAL_DEMO_SPONSORS;
  }
}

export function saveSponsorsToLocal(sponsors: SponsorApplication[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SPONSORS_STORAGE_KEY, JSON.stringify(sponsors));
    window.dispatchEvent(new CustomEvent('sponsorsUpdated', { detail: sponsors }));
  } catch (err) {
    console.error('Failed to save sponsors to localStorage', err);
  }
}

export async function saveSponsorApplication(app: SponsorApplication): Promise<void> {
  const sanitizedApp: SponsorApplication = {
    ...app,
    status: app.status || 'PENDING',
    createdAt: app.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Save locally first
  const current = loadSponsors();
  const existingIdx = current.findIndex(s => s.id === sanitizedApp.id);
  let updated: SponsorApplication[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = sanitizedApp;
  } else {
    updated = [sanitizedApp, ...current];
  }
  saveSponsorsToLocal(updated);

  // 2. Sync with Firestore cloud database
  if (isFirebaseConfigured() && db) {
    try {
      const payload = cleanForFirestore(sanitizedApp);
      await setDoc(doc(db, 'sponsor_applications', sanitizedApp.id), payload, { merge: true });
      console.log('✅ Sponsor application stored in Firestore successfully:', sanitizedApp.id);
    } catch (err: any) {
      console.error('❌ Firestore sponsor save error:', err);
      throw new Error(`Failed to save sponsor application to cloud: ${err.message || err}`);
    }
  }
}

export async function updateSponsorStatus(
  id: string,
  status: SponsorStatus,
  notes?: string
): Promise<void> {
  const current = loadSponsors();
  const updated = current.map(s => {
    if (s.id === id) {
      return {
        ...s,
        status,
        notes: notes !== undefined ? notes : s.notes,
        updatedAt: new Date().toISOString(),
      };
    }
    return s;
  });
  saveSponsorsToLocal(updated);

  if (isFirebaseConfigured() && db) {
    try {
      const payload: Record<string, any> = {
        status,
        updatedAt: new Date().toISOString(),
      };
      if (notes !== undefined) {
        payload.notes = notes;
      }
      await updateDoc(doc(db, 'sponsor_applications', id), payload);
    } catch (err) {
      console.warn('Firestore sponsor status update failed', err);
    }
  }
}

export async function deleteSponsorApplication(id: string): Promise<void> {
  const current = loadSponsors();
  const updated = current.filter(s => s.id !== id);
  saveSponsorsToLocal(updated);

  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'sponsor_applications', id));
    } catch (err) {
      console.warn('Firestore sponsor delete failed', err);
    }
  }
}

export function subscribeToSponsors(callback: (sponsors: SponsorApplication[]) => void): () => void {
  // Deliver current local state first
  callback(loadSponsors());

  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, 'sponsor_applications'));
      const unsubscribe = onSnapshot(
        q,
        snapshot => {
          const remote: SponsorApplication[] = [];
          snapshot.forEach(docSnap => {
            remote.push(parseSponsorDoc(docSnap.id, docSnap.data()));
          });

          remote.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          if (remote.length > 0) {
            saveSponsorsToLocal(remote);
            callback(remote);
          } else {
            callback(loadSponsors());
          }
        },
        error => {
          console.warn('Firestore sponsor listener encountered error, falling back to local', error);
          callback(loadSponsors());
        }
      );

      const handleUpdate = () => callback(loadSponsors());
      window.addEventListener('sponsorsUpdated', handleUpdate);
      window.addEventListener('storage', handleUpdate);

      return () => {
        unsubscribe();
        window.removeEventListener('sponsorsUpdated', handleUpdate);
        window.removeEventListener('storage', handleUpdate);
      };
    } catch (err) {
      console.warn('Could not initialize Firestore sponsor listener', err);
    }
  }

  const handleUpdate = () => callback(loadSponsors());
  window.addEventListener('sponsorsUpdated', handleUpdate);
  window.addEventListener('storage', handleUpdate);
  return () => {
    window.removeEventListener('sponsorsUpdated', handleUpdate);
    window.removeEventListener('storage', handleUpdate);
  };
}

export function exportSponsorsToCSV(sponsors: SponsorApplication[]) {
  const headers = [
    'Application ID',
    'Company',
    'Industry',
    'Tier',
    'Price',
    'Contact Name',
    'Email',
    'Phone',
    'Website',
    'Showcase Interests',
    'Custom Showcase',
    'Details',
    'Status',
    'Created At',
  ];

  const rows = sponsors.map(s => [
    `"${s.id}"`,
    `"${(s.company || '').replace(/"/g, '""')}"`,
    `"${(s.industry || '').replace(/"/g, '""')}"`,
    `"${s.tier}"`,
    `"${s.price}"`,
    `"${(s.contactName || '').replace(/"/g, '""')}"`,
    `"${s.email}"`,
    `"${s.phone}"`,
    `"${s.website || ''}"`,
    `"${(s.showcaseInterests || []).join('; ').replace(/"/g, '""')}"`,
    `"${(s.customShowcase || '').replace(/"/g, '""')}"`,
    `"${(s.details || '').replace(/"/g, '""')}"`,
    `"${s.status}"`,
    `"${new Date(s.createdAt).toLocaleString('en-IN')}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `SCD_2026_Sponsors_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
