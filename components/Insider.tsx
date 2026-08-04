'use client';

// A plain newsletter signup — nothing more. This used to promise a referral
// code and "Vault access," but that code was minted independently in
// Firestore and never actually connected to the real Society membership
// (Supabase-backed, at blklightsociety.com) — so the promise was hollow.
// Two honest tiers now: this box collects an email for updates; the link
// below is the one real path to the fuller membership.
//
// Posts through /api/insider rather than writing to Firestore from the
// browser, so there's one place to add rate limiting later.

import { useState } from 'react';
import { SITE } from '@/lib/site';

type State = 'idle' | 'sending' | 'done' | 'error';

export default function Insider() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');
  const [note, setNote] = useState('One or two emails a month. Unsubscribe anytime.');

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
        body: JSON.stringify({ email, source: 'blklgt.com' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Signup failed.');
      setEmail('');
      setState('done');
      setNote("You're in. Check your inbox.");
    } catch (e) {
      setState('error');
      setNote(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    }
  }

  return (
    <section className="insider" id="insider">
      <span className="label">Newsletter</span>
      <h2>Stay in the loop.</h2>
      <p>
        Release dates, trailers, and tour stops — straight to your inbox, nothing else.
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

      <p className="society-cta">
        Want more than emails?{' '}
        <a href={SITE.society} target="_blank" rel="noopener noreferrer">
          Join the Blacklight Society
        </a>{' '}
        — early access, the Vault, referral rewards.
      </p>
    </section>
  );
}
