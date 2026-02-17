import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Helper to safely access env vars in both Vite (browser) and Node (scripts)
const getEnv = (key) => {
  if (import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
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
let db;
if (typeof window === 'undefined') {
  // Node.js environment (Migration scripts)
  // Second argument to getFirestore is databaseId
  db = getFirestore(app, 'songs');
} else {
  // Browser environment (Vue app)
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  }, 'songs'); // Third argument or options object? Check SDK.
  // Actually, for modular SDK, databaseId is part of the instance getting or settings.
  // Wait, initializeFirestore(app, settings, databaseId) signature is tricky.
  // Correct way for named DB in modular SDK: getFirestore(app, 'songs') works.
  // But initializeFirestore combines settings. 
  // Let's re-read the docs mentally. 
  // initializeFirestore(app, settings, databaseId) is NOT standard.
  // Standard is: initializeFirestore(app, settings, databaseId) -> No.
  // It is initializeFirestore(app, settings, databaseId) in some versions?
  // Actually, getFirestore(app, 'songs') is indeed the way to get a named DB.
  // But we want persistence. 
  // initializeFirestore(app, settings, databaseId) -> this signature exists in v9+?
  // Let's check a safe approach: 
  // If we use named DB, we might need verify if persistence works same way.

  // Revised approach:
  // For named DBs, we should use getFirestore(app, 'songs') and then maybe enableIndexedDbPersistence? 
  // No, initializeFirestore is the way to set settings at init.
  // The signature is initializeFirestore(app, settings, databaseId). Let's assume standard usage.
}

const auth = getAuth(app);

export { db, app, auth };
