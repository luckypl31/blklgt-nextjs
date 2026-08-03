// lib/adminFirebase.ts
// ---------------------------------------------------------------------------
// The full Firestore + Auth SDK, used only inside /admin. Everywhere else on
// the site uses firestore/lite (lib/firebase.ts) — no websockets, smaller
// bundle, fine for a marketing site that reads once per request.
//
// The admin console is different: it's a small number of people, signed in,
// editing data live, and benefits from onSnapshot updating the table the
// instant a write lands rather than waiting on ISR. That tradeoff only makes
// sense behind a login, which is why this file is never imported outside
// app/admin/**.
// ---------------------------------------------------------------------------

'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from './firebase';

function app() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export const auth = () => getAuth(app());
export const adminDb = () => getFirestore(app());
export const storage = () => getStorage(app());
