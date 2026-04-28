import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import {
  firebaseClientConfig,
  firestoreDatabaseId,
  logMissingFirebasePublicEnv,
} from '@/lib/firebase-public-env';

logMissingFirebasePublicEnv('firebase-client');

export const app = getApps().length ? getApp() : initializeApp(firebaseClientConfig);
export const db = firestoreDatabaseId ? getFirestore(app, firestoreDatabaseId) : getFirestore(app);

// Validate Connection to Firestore
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration. The client is offline.');
    }
  }
}
