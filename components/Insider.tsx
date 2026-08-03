'use client';

// The signup goes through /api/insider rather than writing to Firestore from
// the browser. Two reasons: the referral code lives server-side so it can't be
// forged from devtools, and it gives one place to add rate limiting when the
// tour starts pushing traffic here.

import { useState } from 'react';

type State = 'idle' | 'sending' | 'done' | 'error';

export default function Insider({ referredBy }: { referredBy?: string }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');
  const [note, setNote] = useState('Referral codes get you into The Vault.');

  async function submit() {
    if (!/.+@.+\..+/.test(email)) {
      setNote('That email address looks incomplete.');
      setState('error');
      return;
    }
    setState('sending');
    try {
      const res = await fetch('/api/insider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, referredBy, source: 'blklgt.com' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Signup failed.');
      setEmail('');
      setState('done');
      setNote(
        data.code
          ? `You're in. Your referral code is ${data.code} — share it and you both get Vault access.`
          : "You're in. Check your inbox.",
      );
    } catch (e) {
      setState('error');
      setNote(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    }
  }

  return (
    <section className="insider" id="insider">
      <span className="label">The Blacklight Inisder</span>
      <h2>First look. First seat.</h2>
      <p>
        Sign up for exclusive access to trailers before they&rsquo;re public, test screenings, screening invites in your city, and the occasional
        thing we can&rsquo;t put anywhere else. No noise.
      </p>

      <div className="form">
        <label htmlFor="email" style={{ position: 'absolute', left: -9999 }}>
          Email address
        </label>
        <input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@email.com"
          value={email}
          disabled={state === 'sending'}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <button className="btn" onClick={submit} disabled={state === 'sending'}>
          {state === 'sending' ? 'Joining' : 'Join'}
        </button>
      </div>

      <p
        className="formnote"
        role={state === 'error' ? 'alert' : 'status'}
        style={{
          color:
            state === 'done' ? 'var(--uv-hi)' : state === 'error' ? '#E9857A' : undefined,
        }}
      >
        {note}
      </p>
    </section>
  );
}
