// lib/tour.ts
// ---------------------------------------------------------------------------
// Tour dates, now in Firestore instead of hardcoded in lib/site.ts, so the
// admin console can manage them.
//
// The `tourMeta` doc is the answer to "what shows when there's no tour
// booked." A film company is between tours most of the year — the site
// shouldn't have a section that just... disappears when TOUR is empty. It
// swaps to a designed fallback instead, editable in admin so it doesn't go
// stale the next time a tour wraps.
// ---------------------------------------------------------------------------

import {
  collection, doc, getDoc, getDocs, orderBy, query,
  type Firestore,
} from 'firebase/firestore/lite';

export interface TourStop {
  id: string;
  date: string;      // display string, e.g. "Aug 28"
  iso?: string;       // for sorting / structured data
  city: string;
  venue: string;
  url?: string;
  status: 'onsale' | 'pending';
  order?: number;
}

export interface TourMeta {
  headline: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

const FALLBACK_META: TourMeta = {
  headline: 'The next tour is being routed.',
  body: "We take every film on the road — post-screening talkbacks, local partners, the whole thing. Join the Society and you'll hear about the next city before anyone else.",
  ctaLabel: 'Join the Society',
  ctaUrl: '#insider',
};

export async function getTourStops(db: Firestore): Promise<TourStop[]> {
  try {
    const snap = await getDocs(query(collection(db, 'tour'), orderBy('order', 'asc')));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as TourStop);
  } catch (e) {
    console.error('[tour] getTourStops failed:', e);
    return [];
  }
}

export async function getTourMeta(db: Firestore): Promise<TourMeta> {
  try {
    const snap = await getDoc(doc(db, 'content', 'tourMeta'));
    if (!snap.exists()) return FALLBACK_META;
    return { ...FALLBACK_META, ...snap.data() } as TourMeta;
  } catch (e) {
    console.error('[tour] getTourMeta failed:', e);
    return FALLBACK_META;
  }
}
