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
  } catch (err) {
    console.error('Failed to save sponsors to localStorage', err);
  }
}

export async function saveSponsorApplication(app: SponsorApplication): Promise<void> {
  // Save locally first
  const current = loadSponsors();
  const existingIdx = current.findIndex(s => s.id === app.id);
  let updated: SponsorApplication[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = app;
  } else {
    updated = [app, ...current];
  }
  saveSponsorsToLocal(updated);

  // Sync with Firestore if configured
  if (isFirebaseConfigured() && db) {
    try {
      const cleanData: any = {};
      for (const [k, v] of Object.entries(app)) {
        if (v !== undefined) {
          cleanData[k] = v;
        }
      }
      await setDoc(doc(db, 'sponsor_applications', app.id), cleanData, { merge: true });
    } catch (err) {
      console.warn('Firestore sponsor save failed, using local storage', err);
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
      await updateDoc(doc(db, 'sponsor_applications', id), {
        status,
        ...(notes !== undefined ? { notes } : {}),
        updatedAt: new Date().toISOString(),
      });
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
  // Initial local delivery
  callback(loadSponsors());

  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, 'sponsor_applications'));
      const unsubscribe = onSnapshot(
        q,
        snapshot => {
          if (!snapshot.empty) {
            const remote: SponsorApplication[] = [];
            snapshot.forEach(docSnap => {
              remote.push(docSnap.data() as SponsorApplication);
            });
            remote.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            saveSponsorsToLocal(remote);
            callback(remote);
          }
        },
        error => {
          console.warn('Firestore sponsor listener encountered error, falling back to local', error);
          callback(loadSponsors());
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('Could not initialize Firestore sponsor listener', err);
    }
  }

  // Poll localStorage as fallback for multi-tab updates
  const handleStorage = (e: StorageEvent) => {
    if (e.key === SPONSORS_STORAGE_KEY) {
      callback(loadSponsors());
    }
  };
  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
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
