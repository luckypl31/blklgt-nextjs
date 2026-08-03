// lib/bios.ts
// ---------------------------------------------------------------------------
// Founder bios, in Firestore so Andrew can edit his own without asking Wes.
//
// Two lengths on purpose: `shortBio` is what the homepage founder card shows,
// `fullBio` is what appears when someone clicks it open. Storing both instead
// of truncating fullBio client-side means the short version is written as its
// own sentence, not just "the first N characters" — which reads badly when
// it gets cut mid-clause.
// ---------------------------------------------------------------------------

import { collection, getDocs, orderBy, query, type Firestore } from 'firebase/firestore/lite';

export interface Bio {
  slug: string;       // doc id — 'wes' | 'andrew'
  name: string;
  role: string;        // 'Director & Co-Founder'
  photo: string;        // public path, e.g. '/people/wes.jpg', or a Storage path
  shortBio: string;
  fullBio: string;      // paragraphs separated by \n\n
  order?: number;
}

export async function getBios(db: Firestore): Promise<Bio[]> {
  try {
    const snap = await getDocs(query(collection(db, 'bios'), orderBy('order', 'asc')));
    return snap.docs.map((d) => ({ ...d.data(), slug: d.id }) as Bio);
  } catch (e) {
    console.error('[bios] getBios failed:', e);
    return [];
  }
}
