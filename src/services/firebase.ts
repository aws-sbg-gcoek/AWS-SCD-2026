import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration from Vite environment variables or defaults
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAjSCTE1Bj-raYcoFKS2zUS7Hv9RgdUK-Q',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'aws-community-day-2026.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'aws-community-day-2026',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'aws-community-day-2026.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '868942169340',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:868942169340:web:329f9a409b33b91a6a0379',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-D7MWXZ1F32',
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (err) {
  console.warn('Firebase initialization notice:', err);
}

export { app, db, firebaseConfig };
