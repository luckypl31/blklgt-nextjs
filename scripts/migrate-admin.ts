// scripts/migrate-admin.ts
// ---------------------------------------------------------------------------
// The same migration as migrate-films.ts, run through the Firebase Admin SDK
// with a service account instead of a user login.
//
// USE THIS ONE. It's simpler for a one-off script:
//   - no email/password user needs to exist in Authentication
//   - the Admin SDK bypasses security rules entirely, so you don't have to
//     get your UID into firestore.rules and deploy them first
//
// SETUP
//   1. npm install firebase-admin --save-dev
//   2. Firebase console -> Project settings -> Service accounts
//      -> Generate new private key. Save the JSON as serviceAccount.json in
//      the project root.
//   3. Confirm .gitignore has serviceAccount.json in it. This file grants full
//      access to the project — it must never reach a repo or Vercel.
//   4. npm run migrate:admin
//   5. Delete serviceAccount.json when you're done. You can always generate
//      another.
//
// Safe to re-run. It merges, so re-running won't wipe fields you've since
// edited. It does NOT delete the old collection — leave that until
// iamwesmiller.com is reading from the new path and the site looks right.
// ---------------------------------------------------------------------------

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { BLACKLIGHT_FILMS } from './seed-data';
import { FILMS_PATH, slugify, type Film } from '../lib/films';

const KEY_PATH = process.env.SERVICE_ACCOUNT ?? resolve(process.cwd(), 'serviceAccount.json');

// The old web app ID. Only used to FIND the legacy data — nothing we write
// goes under an appId-scoped path. That was the whole problem.
const LEGACY_APP_ID = '1:200074378413:web:d8099b47e301f09eac1a24';

async function main() {
  let serviceAccount: Record<string, string>;
  try {
    serviceAccount = JSON.parse(readFileSync(KEY_PATH, 'utf8'));
  } catch {
    console.error(
      `\nCouldn't read a service account key at:\n  ${KEY_PATH}\n\n` +
        'Firebase console -> Project settings -> Service accounts -> Generate new private key,\n' +
        'save it as serviceAccount.json in the project root, then run this again.\n',
    );
    process.exit(1);
  }

  initializeApp({ credential: cert(serviceAccount as never) });
  const db = getFirestore();

  const batch = db.batch();
  let migrated = 0;
  let skipped = 0;

  // 1. Carry over the legacy filmography — Wes's directing credits. These all
  //    show on iamwesmiller. Only the BLacklight titles go to blklgt.com, and
  //    those are handled by the seed below.
  const legacySnap = await db
    .collection('artifacts')
    .doc(LEGACY_APP_ID)
    .collection('public')
    .doc('data')
    .collection('filmography')
    .get();

  console.log(`Found ${legacySnap.size} records in the legacy filmography.`);

  legacySnap.forEach((d) => {
    const old = d.data() as Record<string, unknown>;
    const title = String(old.title ?? '').trim();
    if (!title) {
      skipped++;
      return;
    }

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

    // merge:true — the richer BLacklight record below wins where they overlap
    batch.set(db.collection(FILMS_PATH).doc(slug), film, { merge: true });
    migrated++;
  });

  // 2. Seed the BLacklight slate.
  BLACKLIGHT_FILMS.forEach((film) => {
    batch.set(db.collection(FILMS_PATH).doc(film.slug), film, { merge: true });
  });

  await batch.commit();

  console.log('');
  console.log(`  Migrated  ${migrated} legacy records`);
  if (skipped) console.log(`  Skipped   ${skipped} untitled records`);
  console.log(`  Seeded    ${BLACKLIGHT_FILMS.length} BLacklight titles`);
  console.log('');
  console.log(`Check the '${FILMS_PATH}' collection in the console, then reload the site.`);
  console.log('The legacy collection was left untouched — delete it manually once');
  console.log('iamwesmiller.com is reading from the new path.');
  process.exit(0);
}

main().catch((e) => {
  console.error('\nMigration failed:', e?.message ?? e);
  process.exit(1);
});
