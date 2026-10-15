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

export type SpeakerStatus = 'UNDER_REVIEW' | 'SHORTLISTED' | 'ACCEPTED' | 'DECLINED';

export interface SpeakerApplication {
  id: string; // e.g. "SPK-2026-X419"
  fullName: string;
  email: string;
  phone: string;
  organization: string; // College or Company
  designation: string; // Current Job Role or Student
  talkTitle: string;
  sessionFormat: string; // "30-min Technical Presentation", "45-min Deep Dive", "20-min Lightning Talk", "Hands-on Workshop"
  audienceLevel: string; // "Level 100 - Beginner", "Level 200 - Intermediate", "Level 300 - Advanced"
  abstract: string; // Summary of talk
  speakerPhotoBase64?: string; // Headshot / profile photo
  certificateProofBase64?: string; // AWS certificate, badge screenshot, proof of knowledge
  certificateLink?: string; // Credly URL or GitHub repository demo link
  skills: string[]; // Selected technical skills + custom skills added by applicant
  linkedin?: string;
  github?: string;
  twitter?: string;
  status: SpeakerStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const SPEAKERS_STORAGE_KEY = 'aws_scd_speakers_v1';

export const INITIAL_DEMO_SPEAKERS: SpeakerApplication[] = [
  {
    id: 'SPK-2026-1042',
    fullName: 'Aditya Deshmukh',
    email: 'aditya.cloud@gmail.com',
    phone: '+91 97654 32109',
    organization: 'TCS Cloud Excellence Lab',
    designation: 'Senior Cloud Solutions Architect',
    talkTitle: 'Mastering AWS Bedrock & Multi-Agent RAG on Serverless Infrastructure',
    sessionFormat: '45-min Deep Dive with Architecture',
    audienceLevel: 'Level 200 - Intermediate',
    abstract: 'A practical, architectural deep-dive into building responsive generative AI agents utilizing Amazon Bedrock, Knowledge Bases, Claude 3.5 Sonnet, and AWS Lambda serverless functions.',
    skills: ['AWS Cloud', 'Generative AI & Bedrock', 'Serverless', 'Python / TypeScript', 'LangChain', 'Vector DBs'],
    certificateLink: 'https://www.credly.com/badges/aws-certified-solutions-architect-professional',
    linkedin: 'https://linkedin.com/in/aditya-deshmukh-cloud',
    github: 'https://github.com/adityadeshmukh',
    status: 'SHORTLISTED',
    createdAt: '2026-10-14T14:15:00.000Z',
    updatedAt: '2026-10-15T11:00:00.000Z',
  },
  {
    id: 'SPK-2026-5518',
    fullName: 'Pooja Mane',
    email: 'pooja.mane@gcoek.ac.in',
    phone: '+91 91234 56780',
    organization: 'Govt. College of Engineering, Kolhapur',
    designation: 'Student Cloud Researcher & Open-Source Contributor',
    talkTitle: 'Zero to Production: Deploying Containerized Microservices with AWS ECS Fargate & CDK',
    sessionFormat: '30-min Technical Presentation',
    audienceLevel: 'Level 100 - Beginner',
    abstract: 'Designed specifically for students and early builders. We will walk through building Docker containers, infrastructure-as-code with AWS CDK, and deploying on serverless Fargate with zero server management.',
    skills: ['AWS Cloud', 'Kubernetes & Containers', 'DevOps & CI/CD', 'AWS CDK', 'Docker'],
    certificateLink: 'https://www.credly.com/badges/aws-certified-cloud-practitioner',
    linkedin: 'https://linkedin.com/in/pooja-mane-dev',
    github: 'https://github.com/poojamane',
    status: 'UNDER_REVIEW',
    createdAt: '2026-10-15T09:40:00.000Z',
    updatedAt: '2026-10-15T09:40:00.000Z',
  },
];

export function loadSpeakers(): SpeakerApplication[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_SPEAKERS;
  try {
    const raw = localStorage.getItem(SPEAKERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SPEAKERS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_SPEAKERS));
      return INITIAL_DEMO_SPEAKERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DEMO_SPEAKERS;
  } catch {
    return INITIAL_DEMO_SPEAKERS;
  }
}

export function saveSpeakersToLocal(speakers: SpeakerApplication[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SPEAKERS_STORAGE_KEY, JSON.stringify(speakers));
  } catch (err) {
    console.error('Failed to save speakers to localStorage', err);
  }
}

export async function saveSpeakerApplication(app: SpeakerApplication): Promise<void> {
  const current = loadSpeakers();
  const existingIdx = current.findIndex(s => s.id === app.id);
  let updated: SpeakerApplication[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = app;
  } else {
    updated = [app, ...current];
  }
  saveSpeakersToLocal(updated);

  if (isFirebaseConfigured() && db) {
    try {
      const cleanData: any = {};
      for (const [k, v] of Object.entries(app)) {
        if (v !== undefined) {
          cleanData[k] = v;
        }
      }
      await setDoc(doc(db, 'speaker_applications', app.id), cleanData, { merge: true });
    } catch (err) {
      console.warn('Firestore speaker save failed, using local storage', err);
    }
  }
}

export async function updateSpeakerStatus(
  id: string,
  status: SpeakerStatus,
  notes?: string
): Promise<void> {
  const current = loadSpeakers();
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
  saveSpeakersToLocal(updated);

  if (isFirebaseConfigured() && db) {
    try {
      await updateDoc(doc(db, 'speaker_applications', id), {
        status,
        ...(notes !== undefined ? { notes } : {}),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore speaker status update failed', err);
    }
  }
}

export async function deleteSpeakerApplication(id: string): Promise<void> {
  const current = loadSpeakers();
  const updated = current.filter(s => s.id !== id);
  saveSpeakersToLocal(updated);

  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'speaker_applications', id));
    } catch (err) {
      console.warn('Firestore speaker delete failed', err);
    }
  }
}

export function subscribeToSpeakers(callback: (speakers: SpeakerApplication[]) => void): () => void {
  callback(loadSpeakers());

  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, 'speaker_applications'));
      const unsubscribe = onSnapshot(
        q,
        snapshot => {
          if (!snapshot.empty) {
            const remote: SpeakerApplication[] = [];
            snapshot.forEach(docSnap => {
              remote.push(docSnap.data() as SpeakerApplication);
            });
            remote.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            saveSpeakersToLocal(remote);
            callback(remote);
          }
        },
        error => {
          console.warn('Firestore speaker listener error, using local fallback', error);
          callback(loadSpeakers());
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('Could not initialize Firestore speaker listener', err);
    }
  }

  const handleStorage = (e: StorageEvent) => {
    if (e.key === SPEAKERS_STORAGE_KEY) {
      callback(loadSpeakers());
    }
  };
  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
}

export function exportSpeakersToCSV(speakers: SpeakerApplication[]) {
  const headers = [
    'Proposal ID',
    'Speaker Name',
    'Designation / Role',
    'Organization',
    'Email',
    'Phone',
    'Talk Title',
    'Session Format',
    'Audience Level',
    'Skills',
    'Certificate Link',
    'Abstract',
    'LinkedIn',
    'Status',
    'Created At',
  ];

  const rows = speakers.map(s => [
    `"${s.id}"`,
    `"${(s.fullName || '').replace(/"/g, '""')}"`,
    `"${(s.designation || '').replace(/"/g, '""')}"`,
    `"${(s.organization || '').replace(/"/g, '""')}"`,
    `"${s.email}"`,
    `"${s.phone}"`,
    `"${(s.talkTitle || '').replace(/"/g, '""')}"`,
    `"${s.sessionFormat}"`,
    `"${s.audienceLevel}"`,
    `"${(s.skills || []).join('; ').replace(/"/g, '""')}"`,
    `"${s.certificateLink || ''}"`,
    `"${(s.abstract || '').replace(/"/g, '""')}"`,
    `"${s.linkedin || ''}"`,
    `"${s.status}"`,
    `"${new Date(s.createdAt).toLocaleString('en-IN')}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `SCD_2026_Speakers_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
