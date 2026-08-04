import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore/lite';
import { firebaseConfig } from '@/lib/firebase';

export const runtime = 'nodejs';

// Plain newsletter signup — no referral code. This used to mint its own
// BLK- codes, independent of the real Society membership system
// (Supabase-backed, blklightsociety.com), so the code never actually did
// anything — no Vault access, no referral tracking. That promise is gone;
// this collection is just an email list now.

export async function POST(req: Request) {
  let body: { email?: string; source?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  const email = String(body.email ?? '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'That email address looks incomplete.' }, { status: 400 });
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // Doc id is the email, so a second signup updates rather than duplicating.
  const ref = doc(db, 'insiders', email);

  try {
    const existing = await getDoc(ref);
    if (existing.exists()) {
      return NextResponse.json({ ok: true, existing: true });
    }

    await setDoc(ref, {
      email,
      source: body.source ?? 'blklgt.com',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[insider]', e);
    // Never leak the underlying Firestore message to the browser.
    return NextResponse.json(
      { error: "Couldn't save that right now. Try again in a moment." },
      { status: 500 },
    );
  }
}
