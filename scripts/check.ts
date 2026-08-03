// scripts/check.ts — diagnose an empty slate.
// Runs the same query the page runs, and prints why it failed.
//   npx tsx scripts/check.ts

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore/lite';
import { readFileSync } from 'node:fs';

// tsx doesn't auto-load .env.local the way `next dev` does, so read it here.
try {
  readFileSync('.env.local', 'utf8').split('\n').forEach((line) => {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2].trim();
  });
} catch {
  console.error('\nNo .env.local found in this directory. That alone explains an empty slate.\n');
  process.exit(1);
}

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('\n--- env ---');
Object.entries(cfg).forEach(([k, v]) => {
  const bad = !v || v === 'REPLACE_ME';
  console.log(`  ${bad ? 'MISSING ' : 'ok      '} ${k} = ${v ?? '(undefined)'}`);
});

if (!cfg.projectId) {
  console.error('\nprojectId is not set. Every read goes to projects/undefined and fails.\n');
  process.exit(1);
}

const db = getFirestore(initializeApp(cfg as never));

(async () => {
  const all = await getDocs(collection(db, 'films'));
  console.log(`\n--- films collection ---\n  ${all.size} documents total`);

  const snap = await getDocs(
    query(collection(db, 'films'), where('sites', 'array-contains', 'blacklight')),
  );
  console.log(`  ${snap.size} match sites array-contains "blacklight"`);

  if (snap.size === 0 && all.size > 0) {
    console.log('\n  Documents exist but none match. Their sites values are:');
    all.forEach((d) => console.log(`    ${d.id}: ${JSON.stringify(d.data().sites)}`));
  } else {
    snap.forEach((d) => console.log(`    ${d.id}  (order ${d.data().order ?? '-'})`));
  }
  console.log('\nIf this prints 5 matches, the data layer is fine and it\'s a dev-server cache.\nRestart npm run dev.\n');
  process.exit(0);
})().catch((e) => {
  console.error('\nQuery failed:', e?.message ?? e, '\n');
  process.exit(1);
});
