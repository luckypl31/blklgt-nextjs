import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore/lite';
import { firebaseConfig } from '@/lib/firebase';

export const runtime = 'nodejs';

// ---------------------------------------------------------------------------
// Every submission is saved to Firestore first, unconditionally. Email is a
// notification on top of that, not the storage layer. If Resend is
// misconfigured, rate-limited, or just down, the message still exists — you
// find out from the admin console instead of a submission vanishing into a
// failed API call nobody sees. Never let a missing env var eat a lead.
// ---------------------------------------------------------------------------

interface Payload {
  name?: string;
  email?: string;
  message?: string;
}

function validate(body: Payload): string | null {
  if (!body.name?.trim()) return 'Name is required.';
  if (!body.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) return 'That email address looks incomplete.';
  if (!body.message?.trim()) return 'Message is required.';
  if (body.message.length > 5000) return 'That message is too long.';
  return null;
}

async function sendEmail(body: Required<Payload>) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL ?? 'info@blklgt.com';
  const from = process.env.CONTACT_FROM_EMAIL ?? 'BLacklight Site <onboarding@resend.dev>';

  if (!key) {
    console.warn('[contact] RESEND_API_KEY not set — message saved to Firestore only, no email sent.');
    return { sent: false };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to,
      reply_to: body.email,
      subject: `Site contact — ${body.name}`,
      text: `${body.message}\n\n—\n${body.name}\n${body.email}`,
    }),
  });

  if (!res.ok) {
    console.error('[contact] Resend send failed:', await res.text().catch(() => res.statusText));
    return { sent: false };
  }
  return { sent: true };
}

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  const err = validate(body);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const clean = {
    name: body.name!.trim(),
    email: body.email!.trim().toLowerCase(),
    message: body.message!.trim(),
  };

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const db = getFirestore(app);

  try {
    await addDoc(collection(db, 'messages'), {
      ...clean,
      source: 'blklgt.com',
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[contact] Firestore write failed:', e);
    return NextResponse.json(
      { error: "Couldn't save that right now. Try again in a moment." },
      { status: 500 },
    );
  }

  // Email is best-effort. A failure here does not fail the request — the
  // message is already safely stored.
  await sendEmail(clean).catch((e) => console.error('[contact] sendEmail threw:', e));

  return NextResponse.json({ ok: true });
}
