
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

export let app: FirebaseApp;
export let auth: Auth;
export let firestore: Firestore;

// Main exported functions
export function initializeFirebase(): {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} {
  const apps = getApps();
  app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  firestore = getFirestore(app);
  
  return { app, auth, firestore };
}

// Export hooks and providers from other files in this directory
export * from './provider';
// To be created later:
// export * from './auth/use-user';
// export * from './firestore/use-collection';
// export * from './firestore/use-doc';
