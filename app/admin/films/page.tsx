'use client';

// Films admin. Live-subscribed with onSnapshot so a save shows up in the list
// immediately — this is the one place on either site that benefits from the
// full SDK's realtime behavior instead of the lite client everything else
// uses.

import { useEffect, useState } from 'react';
import {
  collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, orderBy, query,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { adminDb, storage } from '@/lib/adminFirebase';
import {
  FILMS_PATH, slugify, chipText, mediaUrl,
  type Film, type FilmStatus, type SiteKey,
} from '@/lib/films';
import { Field, Input, TextArea, Select, ErrorNote, stripUndefined } from '@/components/admin/fields';

const STATUSES: FilmStatus[] = ['development', 'production', 'post', 'in-theaters', 'released'];
const SITES: SiteKey[] = ['blacklight', 'iamwesmiller'];

const BLANK: Film = {
  slug: '', title: '', year: String(new Date().getFullYear()), status: 'development', sites: [],
};

function toLines(s?: string) { return (s ?? '').split('\n').map((x) => x.trim()).filter(Boolean); }
function fromLines(a?: string[]) { return (a ?? []).join('\n'); }

export default function FilmsAdmin() {
  const [films, setFilms] = useState<Film[]>([]);
  const [editing, setEditing] = useState<Film | null>(null);
  const [awardsText, setAwardsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const q = query(collection(adminDb(), FILMS_PATH), orderBy('order', 'asc'));
    return onSnapshot(q, (snap) => {
      setFilms(snap.docs.map((d) => ({ ...d.data(), slug: d.id }) as Film));
    }, (e) => setError(e.message));
  }, []);

  function edit(film: Film) {
    setEditing({ ...film });
    setAwardsText(fromLines(film.awards));
    setError('');
  }

  function newFilm() {
    setEditing({ ...BLANK });
    setAwardsText('');
    setError('');
  }

  async function save() {
    if (!editing) return;
    const slug = editing.slug || slugify(editing.title);
    if (!slug) { setError('Title is required.'); return; }
    if (!editing.sites.length) { setError('Pick at least one site.'); return; }

    setSaving(true);
    setError('');
    try {
      const payload = stripUndefined({ ...editing, slug, awards: toLines(awardsText) || undefined });
      await setDoc(doc(adminDb(), FILMS_PATH, slug), { ...payload, updatedAt: serverTimestamp() }, { merge: true });
      setEditing(null);
    } catch (e) {
      setError(
        e instanceof Error && e.message.includes('permission')
          ? "You don't have access to edit films. Ask Wes to grant your account the films role."
          : (e instanceof Error ? e.message : 'Save failed.'),
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(slug: string) {
    if (!confirm(`Delete "${slug}"? This takes down its live page.`)) return;
    try {
      await deleteDoc(doc(adminDb(), FILMS_PATH, slug));
      if (editing?.slug === slug) setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed. Film deletion is owner-only.');
    }
  }

  async function uploadPoster(file: File) {
    setUploading(true);
    setError('');
    try {
      const path = `images/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
      const r = ref(storage(), path);
      await uploadBytes(r, file);
      await getDownloadURL(r); // confirms the write landed and is readable
      setEditing((f) => (f ? { ...f, poster: path } : f));
    } catch {
      setError('Upload failed. Check Storage rules allow authenticated writes to images/.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: editing ? '1fr 1.3fr' : '1fr', gap: 32 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
          <h1 className="display" style={{ fontSize: 30, margin: 0 }}>Films</h1>
          <button className="btn" style={{ marginLeft: 'auto', padding: '9px 18px' }} onClick={newFilm}>
            New film
          </button>
        </div>

        <div style={{ display: 'grid', gap: 1, background: 'var(--hairline)' }}>
          {films.map((f) => (
            <button
              key={f.slug}
              onClick={() => edit(f)}
              style={{
                display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px',
                background: editing?.slug === f.slug ? 'rgba(110,59,255,.1)' : 'var(--ink)',
                textAlign: 'left',
              }}
            >
              <span style={{ fontFamily: 'var(--font-display),serif', fontSize: 16 }}>{f.title}</span>
              <span style={{ color: 'var(--ash)', fontSize: 12 }}>{f.year}</span>
              <span className="label" style={{ marginLeft: 'auto' }}>{chipText(f)}</span>
            </button>
          ))}
          {!films.length && <p style={{ color: 'var(--ash)', padding: 14 }}>No films yet.</p>}
        </div>
      </div>

      {editing && (
        <div style={{ border: '1px solid var(--hairline)', padding: 24, display: 'grid', gap: 16, alignContent: 'start' }}>
          <Field label="Title">
            <Input
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              onBlur={() => { if (!editing.slug) setEditing((f) => f && { ...f, slug: slugify(f.title) }); }}
            />
          </Field>

          <Field label="Slug (URL — only change this if you know why)">
            <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Year">
              <Input value={editing.year} onChange={(e) => setEditing({ ...editing, year: e.target.value })} />
            </Field>
            <Field label="Genre">
              <Input value={editing.genre ?? ''} onChange={(e) => setEditing({ ...editing, genre: e.target.value })} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Status">
              <Select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as FilmStatus })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Status label override (optional — e.g. 'In theaters Aug 27')">
              <Input value={editing.statusLabel ?? ''} onChange={(e) => setEditing({ ...editing, statusLabel: e.target.value })} />
            </Field>
          </div>

          <Field label="Sites — which sites show this film">
            <div style={{ display: 'flex', gap: 16 }}>
              {SITES.map((s) => (
                <label key={s} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={editing.sites.includes(s)}
                    onChange={(e) => setEditing({
                      ...editing,
                      sites: e.target.checked ? [...editing.sites, s] : editing.sites.filter((x) => x !== s),
                    })}
                  />
                  {s}
                </label>
              ))}
            </div>
          </Field>

          <Field label="Logline / synopsis">
            <TextArea rows={3} value={editing.logline ?? ''} onChange={(e) => setEditing({ ...editing, logline: e.target.value })} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Director"><Input value={editing.director ?? ''} onChange={(e) => setEditing({ ...editing, director: e.target.value })} /></Field>
            <Field label="Writer"><Input value={editing.writer ?? ''} onChange={(e) => setEditing({ ...editing, writer: e.target.value })} /></Field>
          </div>
          <Field label="Starring"><Input value={editing.starring ?? ''} onChange={(e) => setEditing({ ...editing, starring: e.target.value })} /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Producers"><Input value={editing.producers ?? ''} onChange={(e) => setEditing({ ...editing, producers: e.target.value })} /></Field>
            <Field label="Distributor"><Input value={editing.distributor ?? ''} onChange={(e) => setEditing({ ...editing, distributor: e.target.value })} /></Field>
          </div>

          <Field label="Awards (one per line)">
            <TextArea rows={2} value={awardsText} onChange={(e) => setAwardsText(e.target.value)} />
          </Field>

          <Field label="Order (lower shows first on the slate)">
            <Input type="number" value={editing.order ?? ''} onChange={(e) => setEditing({ ...editing, order: e.target.value ? Number(e.target.value) : undefined })} />
          </Field>

          <Field label="Poster">
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              {editing.poster && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(editing.poster)} alt="" style={{ width: 60, height: 90, objectFit: 'cover', border: '1px solid var(--hairline)' }} />
              )}
              <input
                type="file" accept="image/*"
                onChange={(e) => e.target.files?.[0] && uploadPoster(e.target.files[0])}
                disabled={uploading}
              />
              {uploading && <span style={{ fontSize: 12, color: 'var(--ash)' }}>Uploading…</span>}
            </div>
          </Field>

          <ErrorNote>{error}</ErrorNote>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn" onClick={save} disabled={saving}>{saving ? 'Saving' : 'Save'}</button>
            <button onClick={() => setEditing(null)} style={{ color: 'var(--ash)' }}>Cancel</button>
            {films.some((f) => f.slug === editing.slug) && (
              <button onClick={() => remove(editing.slug)} style={{ marginLeft: 'auto', color: '#E9857A' }}>
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
