import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../services/firebase';

export type TicketCode = 'super_early_bird' | 'early_bird' | 'regular';
export type TicketStatus = 'sold_out' | 'open' | 'coming_soon';
export type ScheduleMode = 'manual' | 'scheduled';

export interface TierConfig {
  code: TicketCode;
  label: string;
  tagline: string;
  price: number; // in INR (e.g., 149, 249, 349)
  mode: ScheduleMode;
  manualStatus: TicketStatus;
  openFrom: string; // ISO / datetime-local format
  openUntil: string; // ISO / datetime-local format
  remaining: number;
  highlightBadge?: string;
  dateDescription?: string;
}

export interface TicketSystemConfig {
  version: number;
  lastUpdated: string;
  updatedBy?: string;
  tiers: Record<TicketCode, TierConfig>;
}

export const ADMIN_AUTH_KEY = 'aws_ticket_admin_auth';
export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'AWS-Ticket-Admin-2026!';
export const CONFIG_STORAGE_KEY = 'aws_ticket_tiers_config';

export const DEFAULT_TICKETS_CONFIG: TicketSystemConfig = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  tiers: {
    super_early_bird: {
      code: 'super_early_bird',
      label: 'Super Early Bird Tickets',
      tagline: 'Be Super, Be Early!',
      price: 149,
      mode: 'manual',
      manualStatus: 'sold_out',
      openFrom: '2026-08-01T00:00',
      openUntil: '2026-09-17T18:36',
      remaining: 0,
      dateDescription: 'Available Till: 17th Sep 2026, 06:36 PM (GMT+05:30)',
    },
    early_bird: {
      code: 'early_bird',
      label: 'Early Bird Ticket',
      tagline: 'Early Bird, Be Quick!',
      price: 249,
      mode: 'manual',
      manualStatus: 'open',
      openFrom: '2026-09-18T00:00',
      openUntil: '2026-10-22T17:54',
      remaining: 150,
      highlightBadge: 'Avail Off',
      dateDescription: 'Available until: 22nd Oct 2026, 05:54 PM IST',
    },
    regular: {
      code: 'regular',
      label: 'Regular Ticket',
      tagline: 'General Admission',
      price: 349,
      mode: 'manual',
      manualStatus: 'coming_soon',
      openFrom: '2026-10-22T17:54',
      openUntil: '2026-11-01T23:59',
      remaining: 300,
      dateDescription: 'Available from: 22nd Oct 2026, 05:54 PM IST',
    },
  },
};

export function loadTicketConfig(): TicketSystemConfig {
  if (typeof window === 'undefined') return DEFAULT_TICKETS_CONFIG;
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) return DEFAULT_TICKETS_CONFIG;
    const parsed = JSON.parse(raw) as TicketSystemConfig;
    if (parsed && parsed.tiers && parsed.tiers.early_bird && parsed.tiers.regular) {
      // Ensure all three tiers exist with proper defaults
      return {
        ...DEFAULT_TICKETS_CONFIG,
        ...parsed,
        tiers: {
          super_early_bird: {
            ...DEFAULT_TICKETS_CONFIG.tiers.super_early_bird,
            ...(parsed.tiers.super_early_bird || {}),
          },
          early_bird: {
            ...DEFAULT_TICKETS_CONFIG.tiers.early_bird,
            ...(parsed.tiers.early_bird || {}),
          },
          regular: {
            ...DEFAULT_TICKETS_CONFIG.tiers.regular,
            ...(parsed.tiers.regular || {}),
          },
        },
      };
    }
  } catch (err) {
    console.error('Failed to parse ticket config from localStorage:', err);
  }
  return DEFAULT_TICKETS_CONFIG;
}

/**
 * Saves ticket tier configuration to both localStorage and Cloud Firestore.
 * Automatically synchronizes changes across all users and deployments in real time.
 */
export async function saveTicketConfig(config: TicketSystemConfig): Promise<void> {
  const updated: TicketSystemConfig = {
    ...config,
    version: (config.version || 1) + 1,
    lastUpdated: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('ticketConfigUpdated', { detail: updated }));
  }

  // Sync to Cloud Firestore if configured
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'system_config', 'ticket_tiers');
      await setDoc(docRef, updated, { merge: true });
    } catch (err) {
      console.warn('Error saving ticket config to Firestore:', err);
    }
  }
}

/**
 * Real-time listener for ticket configuration.
 * Listens to Cloud Firestore so price changes in Admin immediately update public panels.
 */
export function subscribeToTicketConfig(callback: (config: TicketSystemConfig) => void): () => void {
  // 1. Immediately fire with local configuration
  callback(loadTicketConfig());

  // 2. Real-time Firestore sync
  let firestoreUnsub: (() => void) | null = null;
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'system_config', 'ticket_tiers');
      firestoreUnsub = onSnapshot(
        docRef,
        snapshot => {
          if (snapshot.exists()) {
            const data = snapshot.data() as TicketSystemConfig;
            if (data && data.tiers) {
              const merged: TicketSystemConfig = {
                ...DEFAULT_TICKETS_CONFIG,
                ...data,
                tiers: {
                  super_early_bird: {
                    ...DEFAULT_TICKETS_CONFIG.tiers.super_early_bird,
                    ...(data.tiers.super_early_bird || {}),
                  },
                  early_bird: {
                    ...DEFAULT_TICKETS_CONFIG.tiers.early_bird,
                    ...(data.tiers.early_bird || {}),
                  },
                  regular: {
                    ...DEFAULT_TICKETS_CONFIG.tiers.regular,
                    ...(data.tiers.regular || {}),
                  },
                },
              };
              if (typeof window !== 'undefined') {
                localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(merged));
              }
              callback(merged);
            }
          }
        },
        err => {
          console.warn('Firestore ticket config onSnapshot error:', err);
        }
      );
    } catch (err) {
      console.warn('Error setting up Firestore ticket config listener:', err);
    }
  }

  // 3. Multi-window / local event listeners
  const handleLocal = () => callback(loadTicketConfig());
  if (typeof window !== 'undefined') {
    window.addEventListener('ticketConfigUpdated', handleLocal);
    window.addEventListener('storage', handleLocal);
  }

  return () => {
    if (firestoreUnsub) firestoreUnsub();
    if (typeof window !== 'undefined') {
      window.removeEventListener('ticketConfigUpdated', handleLocal);
      window.removeEventListener('storage', handleLocal);
    }
  };
}

export function getTierEffectiveStatus(
  tier: TierConfig,
  referenceDate: Date = new Date()
): {
  status: TicketStatus;
  buttonLabel: string;
  isOpen: boolean;
  statusText: string;
} {
  if (tier.mode === 'manual') {
    if (tier.manualStatus === 'open') {
      return {
        status: 'open',
        buttonLabel: 'GRAB YOUR TICKET',
        isOpen: true,
        statusText: 'Open for Bookings',
      };
    }
    if (tier.manualStatus === 'sold_out') {
      return {
        status: 'sold_out',
        buttonLabel: 'SOLD OUT',
        isOpen: false,
        statusText: 'Sold Out',
      };
    }
    return {
      status: 'coming_soon',
      buttonLabel: 'COMING SOON',
      isOpen: false,
      statusText: 'Coming Soon',
    };
  }

  // Scheduled mode: Evaluate time range
  const nowMs = referenceDate.getTime();
  const fromMs = tier.openFrom ? new Date(tier.openFrom).getTime() : 0;
  const untilMs = tier.openUntil ? new Date(tier.openUntil).getTime() : Infinity;

  if (nowMs < fromMs) {
    return {
      status: 'coming_soon',
      buttonLabel: 'COMING SOON',
      isOpen: false,
      statusText: `Opens at ${new Date(tier.openFrom).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })}`,
    };
  }

  if (nowMs >= untilMs) {
    return {
      status: 'sold_out',
      buttonLabel: 'SOLD OUT',
      isOpen: false,
      statusText: `Closed on ${new Date(tier.openUntil).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })}`,
    };
  }

  return {
    status: 'open',
    buttonLabel: 'GRAB YOUR TICKET',
    isOpen: true,
    statusText: `Open until ${new Date(tier.openUntil).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })}`,
  };
}
