'use client';

import { useState } from 'react';

type State = 'idle' | 'sending' | 'done' | 'error';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<State>('idle');
  const [note, setNote] = useState('');

  async function submit() {
    setState('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong.');
      setState('done');
      setNote("Sent. We'll get back to you.");
      setName(''); setEmail(''); setMessage('');
    } catch (e) {
      setState('error');
      setNote(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    }
  }

  if (state === 'done') {
    return <p style={{ color: 'var(--uv-hi)', fontSize: 18 }}>{note}</p>;
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit(); }}
      style={{ display: 'grid', gap: 16, maxWidth: 480 }}
    >
      <div>
        <label htmlFor="c-name" className="label" style={{ display: 'block', marginBottom: 8 }}>Name</label>
        <input id="c-name" value={name} onChange={(e) => setName(e.target.value)} required
          style={inputStyle} />
      </div>
      <div>
        <label htmlFor="c-email" className="label" style={{ display: 'block', marginBottom: 8 }}>Email</label>
        <input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          style={inputStyle} />
      </div>
      <div>
        <label htmlFor="c-message" className="label" style={{ display: 'block', marginBottom: 8 }}>Message</label>
        <textarea id="c-message" value={message} onChange={(e) => setMessage(e.target.value)} required
          rows={6} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
      </div>

      {state === 'error' && <p role="alert" style={{ color: '#E9857A', fontSize: 14 }}>{note}</p>}

      <button className="btn" type="submit" disabled={state === 'sending'} style={{ justifySelf: 'start' }}>
        {state === 'sending' ? 'Sending' : 'Send'}
      </button>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '13px 16px', background: 'transparent',
  border: '1px solid var(--hairline)', borderRadius: 2, color: 'var(--bone)',
  font: 'inherit', fontSize: 15,
};
