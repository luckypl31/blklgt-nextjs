// scripts/migrate-films.ts
// ---------------------------------------------------------------------------
// One-time move: artifacts/{appId}/public/data/filmography  ->  films/{slug}
//
// Run once, signed in as admin:
//   npx tsx scripts/migrate-films.ts
//
// Safe to re-run. It merges, so re-running won't wipe fields you've since
// edited in the admin console. It does NOT delete the old collection — leave
// that in place until iamwesmiller.com is reading from the new path and you've
// confirmed the site looks right.
// ---------------------------------------------------------------------------

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { FILMS_PATH, slugify, type Film } from '../lib/films';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: 'iamwesmiller-270ac.firebaseapp.com',
  projectId: 'iamwesmiller-270ac',
  storageBucket: 'iamwesmiller-270ac.firebasestorage.app',
  messagingSenderId: '200074378413',
  appId: '1:200074378413:web:d8099b47e301f09eac1a24',
};

const LEGACY_PATH = ['artifacts', firebaseConfig.appId, 'public', 'data', 'filmography'] as const;

import { BLACKLIGHT_FILMS } from './seed-data';

async function main() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  await signInWithEmailAndPassword(
    getAuth(app),
    process.env.ADMIN_EMAIL!,
    process.env.ADMIN_PASSWORD!,
  );

  const batch = writeBatch(db);
  let migrated = 0;

  // 1. Carry over the legacy filmography. These are Wes's directing credits —
  //    they all show on iamwesmiller. Only the BLacklight ones get added to
  //    blklgt.com, and those are handled by the seed below.
  const legacy = await getDocs(collection(db, ...LEGACY_PATH));
  legacy.forEach((d) => {
    const old = d.data() as Record<string, unknown>;
    const title = String(old.title ?? '').trim();
    if (!title) return;

    const slug = slugify(title);
    const film: Partial<Film> = {
      slug,
      title,
      year: String(old.year ?? ''),
      status: 'released',
      role: (old.role as string) ?? '',
      starring: (old.starring as string) ?? '',
      notes: (old.notes as string) ?? '',
      logline: (old.logline as string) ?? '',
      poster: (old.poster as string) ?? '',
      videoUrl: (old.videoUrl as string) ?? '',
      whereToWatch: (old.whereToWatch as Film['whereToWatch']) ?? [],
      company: 'other',
      sites: ['iamwesmiller'],
    };

    // merge:true means the richer BLacklight record below wins on overlap
    batch.set(doc(db, FILMS_PATH, slug), film, { merge: true });
    migrated++;
  });

  // 2. Seed / overwrite the BLacklight slate.
  BLACKLIGHT_FILMS.forEach((film) => {
    batch.set(doc(db, FILMS_PATH, film.slug), film, { merge: true });
  });

  await batch.commit();
  console.log(`Migrated ${migrated} legacy records. Seeded ${BLACKLIGHT_FILMS.length} BLacklight titles.`);
  console.log('Legacy collection left untouched — delete it manually once both sites are verified.');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
