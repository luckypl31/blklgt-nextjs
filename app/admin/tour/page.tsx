'use client';

import { useEffect, useState } from 'react';
import {
  collection, onSnapshot, doc, setDoc, deleteDoc, getDoc, orderBy, query,
} from 'firebase/firestore';
import { adminDb } from '@/lib/adminFirebase';
import type { TourStop, TourMeta } from '@/lib/tour';
import { Field, Input, TextArea, Select, ErrorNote, stripUndefined } from '@/components/admin/fields';

const BLANK: TourStop = { id: '', date: '', city: '', venue: '', status: 'onsale' };

export default function TourAdmin() {
  const [stops, setStops] = useState<TourStop[]>([]);
  const [editing, setEditing] = useState<TourStop | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [meta, setMeta] = useState<TourMeta>({ headline: '', body: '', ctaLabel: '', ctaUrl: '' });
  const [metaSaving, setMetaSaving] = useState(false);
  const [metaSaved, setMetaSaved] = useState(false);

  useEffect(() => {
    const q = query(collection(adminDb(), 'tour'), orderBy('order', 'asc'));
    return onSnapshot(q, (snap) => {
      setStops(snap.docs.map((d) => ({ ...d.data(), id: d.id }) as TourStop));
    }, (e) => setError(e.message));
  }, []);

  useEffect(() => {
    getDoc(doc(adminDb(), 'content', 'tourMeta')).then((snap) => {
      if (snap.exists()) setMeta(snap.data() as TourMeta);
    });
  }, []);

  function edit(stop: TourStop) { setEditing({ ...stop }); setError(''); }
  function add() { setEditing({ ...BLANK, id: `stop-${Date.now()}`, order: stops.length }); setError(''); }

  async function save() {
    if (!editing) return;
    if (!editing.city || !editing.venue) { setError('City and venue are required.'); return; }
    setSaving(true);
    setError('');
    try {
      await setDoc(doc(adminDb(), 'tour', editing.id), stripUndefined({ ...editing }), { merge: true });
      setEditing(null);
    } catch (e) {
      setError(
        e instanceof Error && e.message.includes('permission')
          ? "You don't have access to edit the tour. Ask Wes to grant your account the films role."
          : 'Save failed.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Remove this stop?')) return;
    try {
      await deleteDoc(doc(adminDb(), 'tour', id));
      if (editing?.id === id) setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed.');
    }
  }

  async function saveMeta() {
    setMetaSaving(true);
    setMetaSaved(false);
    try {
      await setDoc(doc(adminDb(), 'content', 'tourMeta'), stripUndefined(meta), { merge: true });
      setMetaSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setMetaSaving(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 40 }}>
      <div style={{ display: 'grid', gridTemplateColumns: editing ? '1fr 1fr' : '1fr', gap: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
            <h1 className="display" style={{ fontSize: 30, margin: 0 }}>Tour</h1>
            <button className="btn" style={{ marginLeft: 'auto', padding: '9px 18px' }} onClick={add}>
              Add stop
            </button>
          </div>

          <div style={{ display: 'grid', gap: 1, background: 'var(--hairline)' }}>
            {stops.map((s) => (
              <button
                key={s.id}
                onClick={() => edit(s)}
                style={{
                  display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px',
                  background: editing?.id === s.id ? 'rgba(110,59,255,.1)' : 'var(--ink)',
                  textAlign: 'left',
                }}
              >
                <span style={{ color: 'var(--ash)', fontSize: 13, width: 60 }}>{s.date || 'TBA'}</span>
                <span>{s.city}</span>
                <span className="label" style={{ marginLeft: 'auto' }}>{s.status}</span>
              </button>
            ))}
            {!stops.length && (
              <p style={{ color: 'var(--ash)', padding: 14 }}>
                No stops. The site is currently showing the fallback message below.
              </p>
            )}
          </div>
        </div>

        {editing && (
          <div style={{ border: '1px solid var(--hairline)', padding: 24, display: 'grid', gap: 16, alignContent: 'start' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Display date (e.g. Aug 28, or TBA)">
                <Input value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} />
              </Field>
              <Field label="ISO date (optional, for sorting)">
                <Input type="date" value={editing.iso ?? ''} onChange={(e) => setEditing({ ...editing, iso: e.target.value })} />
              </Field>
            </div>
            <Field label="City"><Input value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value })} /></Field>
            <Field label="Venue"><Input value={editing.venue} onChange={(e) => setEditing({ ...editing, venue: e.target.value })} /></Field>
            <Field label="Ticket URL"><Input value={editing.url ?? ''} onChange={(e) => setEditing({ ...editing, url: e.target.value })} /></Field>
            <Field label="Status">
              <Select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as TourStop['status'] })}>
                <option value="onsale">onsale</option>
                <option value="pending">pending (venue/date TBA)</option>
              </Select>
            </Field>
            <Field label="Order (lower shows first)">
              <Input type="number" value={editing.order ?? ''} onChange={(e) => setEditing({ ...editing, order: e.target.value ? Number(e.target.value) : undefined })} />
            </Field>

            <ErrorNote>{error}</ErrorNote>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn" onClick={save} disabled={saving}>{saving ? 'Saving' : 'Save'}</button>
              <button onClick={() => setEditing(null)} style={{ color: 'var(--ash)' }}>Cancel</button>
              {stops.some((s) => s.id === editing.id) && (
                <button onClick={() => remove(editing.id)} style={{ marginLeft: 'auto', color: '#E9857A' }}>Delete</button>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: 28 }}>
        <h2 className="display" style={{ fontSize: 24, marginBottom: 6 }}>No-tour fallback</h2>
        <p style={{ color: 'var(--ash)', fontSize: 13, marginBottom: 18, maxWidth: '56ch' }}>
          Shown on the site whenever the stop list above is empty — between tours, the section
          doesn&rsquo;t just vanish.
        </p>
        <div style={{ display: 'grid', gap: 16, maxWidth: 560 }}>
          <Field label="Headline">
            <Input value={meta.headline} onChange={(e) => setMeta({ ...meta, headline: e.target.value })} />
          </Field>
          <Field label="Body">
            <TextArea rows={3} value={meta.body} onChange={(e) => setMeta({ ...meta, body: e.target.value })} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Button label"><Input value={meta.ctaLabel} onChange={(e) => setMeta({ ...meta, ctaLabel: e.target.value })} /></Field>
            <Field label="Button link"><Input value={meta.ctaUrl} onChange={(e) => setMeta({ ...meta, ctaUrl: e.target.value })} /></Field>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="btn" onClick={saveMeta} disabled={metaSaving}>{metaSaving ? 'Saving' : 'Save'}</button>
            {metaSaved && <span style={{ color: 'var(--uv-hi)', fontSize: 13 }}>Saved.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
