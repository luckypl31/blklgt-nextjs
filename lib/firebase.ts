// lib/firebase.ts
// ---------------------------------------------------------------------------
// One config, two SDKs.
//
// The public site never needs a live socket — it's a marketing site, not a
// dashboard. So reads go through firebase/firestore/lite, which is a plain
// REST client: no websockets, no grpc, runs cleanly in Node and on the edge,
// and is a fraction of the bundle. Pages use ISR to pick up admin edits.
//
// The full SDK is only pulled in where we actually write (the Insider form).
// ---------------------------------------------------------------------------

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore as getLiteFirestore, type Firestore } from 'firebase/firestore/lite';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

export function app(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

/** Read-only Firestore handle. Safe in server components and route handlers. */
export function db(): Firestore {
  return getLiteFirestore(app());
}
