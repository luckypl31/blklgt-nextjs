// scripts/grant-role.ts
// ---------------------------------------------------------------------------
// Grant or revoke someone's access, without hand-editing documents in the
// console (where a typo is a silent lockout or a silent over-grant).
//
//   npm run grant -- --email andrew@example.com --films
//   npm run grant -- --email marketing@example.com --films --insiders
//   npm run grant -- --email andrew@example.com --revoke
//   npm run grant -- --list
//
// Roles:
//   --films      edit the shared film slate (both sites)
//   --insiders   read and export the mailing list
//   --personal   edit iamwesmiller content: bio, quotes, log, scripts
//
// Grant the narrowest thing that does the job. Marketing needs --films and
// nothing else — that's the whole reason the roles are split.
//
// Needs serviceAccount.json (see migrate-admin.ts for how to get one).
// ---------------------------------------------------------------------------

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const KEY_PATH = process.env.SERVICE_ACCOUNT ?? resolve(process.cwd(), 'serviceAccount.json');
const ROLES = ['films', 'insiders', 'personal'] as const;

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}
const has = (flag: string) => process.argv.includes(`--${flag}`);

async function main() {
  let key: Record<string, string>;
  try {
    key = JSON.parse(readFileSync(KEY_PATH, 'utf8'));
  } catch {
    console.error(`\nNo service account key at ${KEY_PATH}.\nSee scripts/migrate-admin.ts for how to generate one.\n`);
    process.exit(1);
  }

  initializeApp({ credential: cert(key as never) });
  const db = getFirestore();

  // --list
  if (has('list')) {
    const snap = await db.collection('roles').get();
    if (snap.empty) {
      console.log('\nNo roles granted yet. Only the owner UID in firestore.rules has access.\n');
      process.exit(0);
    }
    console.log('');
    snap.forEach((d) => {
      const r = d.data();
      const granted = ROLES.filter((k) => r[k] === true);
      console.log(`  ${r.name ?? d.id}  ${r.email ?? ''}`);
      console.log(`     ${granted.length ? granted.join(', ') : '(no roles — effectively revoked)'}`);
    });
    console.log('');
    process.exit(0);
  }

  const email = arg('email');
  if (!email) {
    console.error('\nNeed --email. Try: npm run grant -- --email someone@example.com --films\n');
    process.exit(1);
  }

  // Resolve the email to a UID. The person must have signed in at least once,
  // otherwise there's no account to attach a role to.
  let uid: string;
  let displayName: string | undefined;
  try {
    const user = await getAuth().getUserByEmail(email);
    uid = user.uid;
    displayName = user.displayName ?? undefined;
  } catch {
    console.error(
      `\nNo account found for ${email}.\n` +
        'They need to sign in to the admin console once before a role can be attached.\n',
    );
    process.exit(1);
  }

  const ref = db.collection('roles').doc(uid);

  if (has('revoke')) {
    await ref.delete();
    console.log(`\nRevoked all access for ${email}.\n`);
    process.exit(0);
  }

  const granted = ROLES.filter((r) => has(r));
  if (!granted.length) {
    console.error(`\nPick at least one role: ${ROLES.map((r) => `--${r}`).join(' ')}\n`);
    process.exit(1);
  }

  await ref.set(
    {
      email,
      name: displayName ?? email,
      ...Object.fromEntries(ROLES.map((r) => [r, granted.includes(r)])),
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );

  console.log(`\n${displayName ?? email} can now edit: ${granted.join(', ')}`);
  const withheld = ROLES.filter((r) => !granted.includes(r));
  if (withheld.length) console.log(`Not granted: ${withheld.join(', ')}`);
  console.log('');
  process.exit(0);
}

main().catch((e) => {
  console.error('\nFailed:', e?.message ?? e);
  process.exit(1);
});
