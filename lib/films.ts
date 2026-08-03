// lib/films.ts
// ---------------------------------------------------------------------------
// Single source of truth for film data across blklgt.com and iamwesmiller.com.
// Both apps import this file. Both point at the same Firestore project.
//
// WHY THE PATH CHANGED
// The old path was:  artifacts/{appId}/public/data/filmography
// ...where appId is a *web app registration* ID. Register blklgt.com as a
// second web app in the same project and it gets a different appId, so it
// reads an empty collection. The namespace was per-app, which is the opposite
// of shared.
//
// Now: a top-level `films` collection keyed by slug. Nothing app-specific in
// the path. Which site shows a film is data (`sites`), not path structure.
// ---------------------------------------------------------------------------

import {
  collection, doc, getDoc, getDocs, query, where,
  type Firestore,
} from 'firebase/firestore/lite';

export const FILMS_PATH = 'films';
export const STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'iamwesmiller-270ac.firebasestorage.app';

export type SiteKey = 'blacklight' | 'iamwesmiller';

export type FilmStatus =
  | 'development'
  | 'production'
  | 'post'
  | 'in-theaters'
  | 'released';

export interface WatchLink {
  platform: string; // 'BET+', 'Prime Video', 'Tickets'
  url: string;
}

export interface Film {
  /** Firestore doc id === slug. Also the URL: /films/wildcards */
  slug: string;
  title: string;
  year: string;
  status: FilmStatus;
  /** Overrides the default chip text. e.g. "In theaters Aug 27" */
  statusLabel?: string;

  genre?: string;
  logline?: string;
  synopsis?: string;

  // --- credits ---
  director?: string;
  writer?: string;
  starring?: string;
  producers?: string;
  cinematographer?: string;
  composer?: string;
  /** Wes's specific credit. Surfaced on iamwesmiller, not on the company site. */
  role?: string;
  notes?: string;

  // --- company ---
  company?: 'blacklight' | 'other';
  distributor?: string;
  awards?: string[];

  // --- media ---
  // Store the Storage PATH, not a signed URL. Tokens regenerate on re-upload
  // and every stored reference dies. Resolve at render time with mediaUrl().
  poster?: string; // 'images/WildCards_27x40_social.jpg'
  still?: string;
  trailerUrl?: string;
  videoUrl?: string;
  whereToWatch?: WatchLink[];

  // --- routing ---
  /** Which sites render this film. A film can appear on both. */
  sites: SiteKey[];
  /** Manual sort. Lower = earlier on the slate. Falls back to year desc. */
  order?: number;
}

export const STATUS_LABEL: Record<FilmStatus, string> = {
  development: 'Development',
  production: 'In production',
  post: 'Post',
  'in-theaters': 'In theaters',
  released: 'Released',
};

export function chipText(film: Film): string {
  return film.statusLabel ?? STATUS_LABEL[film.status];
}

/**
 * Resolve a Storage path to a public URL.
 * Requires public read on images/ (see storage.rules). Absolute URLs pass
 * through untouched so legacy token-bearing records keep working.
 */
export function mediaUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodeURIComponent(path)}?alt=media`;
}

function sortFilms(films: Film[]): Film[] {
  return films.sort((a, b) => {
    const ao = a.order ?? 999;
    const bo = b.order ?? 999;
    if (ao !== bo) return ao - bo;
    return Number(b.year) - Number(a.year);
  });
}

/**
 * Reads never throw. If Firestore is unreachable during a build, we return an
 * empty slate and the page renders its empty state instead of failing the
 * whole deploy. A film company's site going down because a database blipped
 * during `next build` is not an acceptable failure mode — especially with a
 * theatrical release on the calendar.
 */


export async function getFilms(db: Firestore, site: SiteKey = 'blacklight'): Promise<Film[]> {
  try {
    const snap = await getDocs(
      query(collection(db, FILMS_PATH), where('sites', 'array-contains', site)),
    );
    return sortFilms(snap.docs.map((d) => ({ ...d.data(), slug: d.id }) as Film));
  } catch (e) {
    console.error('[films] getFilms failed, rendering empty slate:', e);
    return [];
  }
}

export async function getFilm(db: Firestore, slug: string): Promise<Film | null> {
  try {
    const snap = await getDoc(doc(db, FILMS_PATH, slug));
    if (!snap.exists()) return null;
    return { ...snap.data(), slug: snap.id } as Film;
  } catch (e) {
    console.error(`[films] getFilm(${slug}) failed:`, e);
    return null;
  }
}

export function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
