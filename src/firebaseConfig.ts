import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

// Node.js process type for scripts that run outside Vite
declare const process: { env: Record<string, string | undefined> } | undefined;

// Helper to safely access env vars in both Vite (browser) and Node (scripts)
const getEnv = (key: string): string | undefined => {
  if (import.meta.env && import.meta.env[key]) {
    return import.meta.env[key] as string;
  }
  if (typeof process !== 'undefined' && process?.env?.[key]) {
    return process.env[key];
  }
  return undefined;
};

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID')
};

// Start in test mode warning
if (!firebaseConfig.projectId) {
  console.error('Firebase Project ID is missing. Check .env.local or build secrets.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
let db: Firestore;
if (typeof window === 'undefined') {
  // Node.js environment (Migration scripts)
  db = getFirestore(app, 'songs');
} else {
  // Browser environment (Vue app)
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  }, 'songs');
}

const auth = getAuth(app);

export { db, app, auth };
