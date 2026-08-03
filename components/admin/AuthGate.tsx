'use client';

// Gates everything under /admin behind Firebase email/password auth. This is
// a UX gate, not the real security boundary — Firestore rules are what
// actually decide who can write what. A signed-in user with no roles/ doc can
// still open every screen here; their writes will just fail with a clear
// inline error, because that's simpler and more honest than duplicating the
// owner/role logic client-side and risking it drifting out of sync with the
// rules that actually matter.

import { useEffect, useState } from 'react';
import {
  onAuthStateChanged, signInWithEmailAndPassword, signOut, type User,
} from 'firebase/auth';
import { auth } from '@/lib/adminFirebase';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = loading
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => onAuthStateChanged(auth(), setUser), []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth(), email.trim(), password);
    } catch {
      setError('Wrong email or password.');
    } finally {
      setBusy(false);
    }
  }

  if (user === undefined) {
    return <div style={{ padding: '160px var(--pad)', color: 'var(--ash)' }}>Checking sign-in…</div>;
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 380, margin: '160px auto', padding: '0 var(--pad)' }}>
        <span className="label">Admin</span>
        <h1 className="display" style={{ fontSize: 40, margin: '14px 0 28px' }}>Sign in.</h1>
        <form onSubmit={login} style={{ display: 'grid', gap: 14 }}>
          <input
            type="email" placeholder="you@blklgt.com" value={email} autoComplete="username"
            onChange={(e) => setEmail(e.target.value)} required
            style={{ padding: '13px 16px', background: 'transparent', border: '1px solid var(--hairline)', color: 'var(--bone)', borderRadius: 2, font: 'inherit' }}
          />
          <input
            type="password" placeholder="Password" value={password} autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)} required
            style={{ padding: '13px 16px', background: 'transparent', border: '1px solid var(--hairline)', color: 'var(--bone)', borderRadius: 2, font: 'inherit' }}
          />
          {error && <p role="alert" style={{ color: '#E9857A', fontSize: 14, margin: 0 }}>{error}</p>}
          <button className="btn" disabled={busy} type="submit">{busy ? 'Signing in' : 'Sign in'}</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '16px var(--pad)',
        borderBottom: '1px solid var(--hairline)', fontSize: 13, color: 'var(--ash)',
      }}>
        <span>{user.email}</span>
        <button
          onClick={() => signOut(auth())}
          style={{ marginLeft: 'auto', fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ash)' }}
        >
          Sign out
        </button>
      </div>
      {children}
    </div>
  );
}
