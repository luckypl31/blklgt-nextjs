'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { adminDb } from '@/lib/adminFirebase';
import type { PressMention } from '@/lib/press';
import { Field, Input, TextArea, ErrorNote, stripUndefined } from '@/components/admin/fields';

const BLANK: PressMention = { id: '', outlet: '' };

export default function PressAdmin() {
  const [mentions, setMentions] = useState<PressMention[]>([]);
  const [editing, setEditing] = useState<PressMention | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // No server-side orderBy — see lib/press.ts for why: it silently drops
    // any doc missing the `order` field. Sort client-side instead.
    return onSnapshot(collection(adminDb(), 'press'), (snap) => {
      const list = snap.docs.map((d) => ({ ...d.data(), id: d.id }) as PressMention);
      list.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      setMentions(list);
    }, (e) => setError(e.message));
  }, []);

  function edit(m: PressMention) { setEditing({ ...m }); setError(''); }
  function add() { setEditing({ ...BLANK, id: `press-${Date.now()}`, order: mentions.length }); setError(''); }

  async function save() {
    if (!editing) return;
    if (!editing.outlet.trim()) { setError('Outlet name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await setDoc(doc(adminDb(), 'press', editing.id), stripUndefined({ ...editing }), { merge: true });
      setEditing(null);
    } catch (e) {
      setError(
        e instanceof Error && e.message.includes('permission')
          ? "You don't have access to edit press. Ask Wes to grant your account the films role."
          : 'Save failed.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Remove this press mention?')) return;
    try {
      await deleteDoc(doc(adminDb(), 'press', id));
      if (editing?.id === id) setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed.');
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: editing ? '1fr 1fr' : '1fr', gap: 32 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
          <h1 className="display" style={{ fontSize: 30, margin: 0 }}>Press</h1>
          <button className="btn" style={{ marginLeft: 'auto', padding: '9px 18px' }} onClick={add}>
            Add mention
          </button>
        </div>

        <div style={{ display: 'grid', gap: 1, background: 'var(--hairline)' }}>
          {mentions.map((m) => (
            <button
              key={m.id}
              onClick={() => edit(m)}
              style={{
                display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px',
                background: editing?.id === m.id ? 'rgba(110,59,255,.1)' : 'var(--ink)',
                textAlign: 'left',
              }}
            >
              <span style={{ fontFamily: 'var(--font-display),serif', fontSize: 16 }}>{m.outlet}</span>
              {m.quote && (
                <span style={{ color: 'var(--ash)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  &ldquo;{m.quote}&rdquo;
                </span>
              )}
            </button>
          ))}
          {!mentions.length && <p style={{ color: 'var(--ash)', padding: 14 }}>No press mentions yet.</p>}
        </div>
      </div>

      {editing && (
        <div style={{ border: '1px solid var(--hairline)', padding: 24, display: 'grid', gap: 16, alignContent: 'start' }}>
          <Field label="Outlet (e.g. Variety, Essence, Deadline)">
            <Input value={editing.outlet} onChange={(e) => setEditing({ ...editing, outlet: e.target.value })} />
          </Field>
          <Field label="Pull-quote (optional — keep it short)">
            <TextArea rows={3} value={editing.quote ?? ''} onChange={(e) => setEditing({ ...editing, quote: e.target.value })} />
          </Field>
          <Field label="Link to the piece (optional)">
            <Input value={editing.url ?? ''} onChange={(e) => setEditing({ ...editing, url: e.target.value })} placeholder="https://..." />
          </Field>
          <Field label="Order (lower shows first)">
            <Input
              type="number"
              value={editing.order ?? ''}
              onChange={(e) => setEditing({ ...editing, order: e.target.value ? Number(e.target.value) : undefined })}
            />
          </Field>

          <ErrorNote>{error}</ErrorNote>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn" onClick={save} disabled={saving}>{saving ? 'Saving' : 'Save'}</button>
            <button onClick={() => setEditing(null)} style={{ color: 'var(--ash)' }}>Cancel</button>
            {mentions.some((m) => m.id === editing.id) && (
              <button onClick={() => remove(editing.id)} style={{ marginLeft: 'auto', color: '#E9857A' }}>
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
