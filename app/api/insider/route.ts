import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore/lite';
import { firebaseConfig } from '@/lib/firebase';

export const runtime = 'nodejs';

/**
 * Referral codes match the BLK- format already in use by the Society signup
 * flow, so codes issued here and codes issued there are interchangeable.
 */
function makeCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 — people read these aloud on tour
  let out = '';
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `BLK-${out}`;
}

export async function POST(req: Request) {
  let body: { email?: string; referredBy?: string; source?: string };
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
      return NextResponse.json({ ok: true, code: existing.data().code ?? null, existing: true });
    }

    const code = makeCode();
    await setDoc(ref, {
      email,
      code,
      referredBy: body.referredBy ?? null,
      source: body.source ?? 'blklgt.com',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, code });
  } catch (e) {
    console.error('[insider]', e);
    // Never leak the underlying Firestore message to the browser.
    return NextResponse.json(
      { error: "Couldn't save that right now. Try again in a moment." },
      { status: 500 },
    );
  }
}
