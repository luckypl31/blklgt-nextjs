// lib/press.ts
// ---------------------------------------------------------------------------
// Press mentions — the other half of the trophy room, alongside the awards
// already living on each film's `awards` array (see lib/films.ts). Awards
// don't need a new collection; press does, since nothing else tracks it.
//
// Deliberately thin: outlet name, an optional short pull-quote, an optional
// link out. No logo images — see the page component for why.
// ---------------------------------------------------------------------------

import { collection, getDocs, type Firestore } from 'firebase/firestore/lite';

export interface PressMention {
  id: string;
  outlet: string;
  quote?: string;
  url?: string;
  order?: number;
}

export async function getPress(db: Firestore): Promise<PressMention[]> {
  try {
    // No server-side orderBy — Firestore's orderBy silently drops any
    // document missing that field (the exact bug the films admin hit
    // earlier). Fetch everything, sort client-side instead.
    const snap = await getDocs(collection(db, 'press'));
    const list = snap.docs.map((d) => ({ ...d.data(), id: d.id }) as PressMention);
    return list.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  } catch (e) {
    console.error('[press] getPress failed:', e);
    return [];
  }
}

/**
 * Awards live on each film, not in their own collection — one admin edit
 * updates both the film page and this trophy wall. This just flattens them
 * out and keeps the film attached, so each trophy can link back.
 */
export interface Trophy {
  id: string;
  title: string;      // "Best Narrative Feature"
  subtitle?: string;   // "Essence Film Festival, 2025"
  filmTitle: string;
  filmSlug: string;
}

export function trophiesFromFilms(
  films: { title: string; slug: string; awards?: string[] }[],
): Trophy[] {
  const out: Trophy[] = [];
  films.forEach((f) => {
    (f.awards ?? []).forEach((raw, i) => {
      const [title, subtitle] = raw.split(/\s+—\s+/);
      out.push({
        id: `${f.slug}-${i}`,
        title: title ?? raw,
        subtitle,
        filmTitle: f.title,
        filmSlug: f.slug,
      });
    });
  });
  return out;
}
