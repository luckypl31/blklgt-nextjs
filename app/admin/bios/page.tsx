'use client';

// Two fixed bios (Wes, Andrew) rather than a general list — the founder
// section on the homepage is hardcoded to two people, so an add/delete UI
// here would let someone create a state the site can't render. If a third
// founder is ever added, that's a code change to Founders.tsx, not an admin
// task.

import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, setDoc, orderBy, query } from 'firebase/firestore';
import { adminDb } from '@/lib/adminFirebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/adminFirebase';
import type { Bio } from '@/lib/bios';
import { mediaUrl } from '@/lib/films';
import { Field, Input, TextArea, ErrorNote, stripUndefined } from '@/components/admin/fields';

const EXPECTED: { slug: string; name: string; order: number }[] = [
  { slug: 'wes', name: 'Wes Miller', order: 1 },
  { slug: 'andrew', name: 'Andrew van den Houten', order: 2 },
];

export default function BiosAdmin() {
  const [bios, setBios] = useState<Record<string, Bio>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Record<string, number>>({});
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(adminDb(), 'bios'), orderBy('order', 'asc'));
    return onSnapshot(q, (snap) => {
      const next: Record<string, Bio> = {};
      snap.forEach((d) => { next[d.id] = { ...d.data(), slug: d.id } as Bio; });
      setBios(next);
    }, (e) => setError(e.message));
  }, []);

  function get(slug: string, name: string, order: number): Bio {
    return bios[slug] ?? { slug, name, role: '', photo: '', shortBio: '', fullBio: '', order };
  }

  function set(slug: string, patch: Partial<Bio>) {
    setBios((b) => ({ ...b, [slug]: { ...get(slug, patch.name ?? slug, 0), ...b[slug], ...patch } }));
  }

  async function save(slug: string) {
    const bio = bios[slug];
    if (!bio) return;
    setSaving(slug);
    setError('');
    try {
      await setDoc(doc(adminDb(), 'bios', slug), stripUndefined({ ...bio }), { merge: true });
      setSavedAt((s) => ({ ...s, [slug]: Date.now() }));
    } catch (e) {
      setError(
        e instanceof Error && e.message.includes('permission')
          ? "You don't have access to edit bios. Ask Wes to grant your account the films role."
          : 'Save failed.',
      );
    } finally {
      setSaving(null);
    }
  }

  async function uploadPhoto(slug: string, file: File) {
    setUploading(slug);
    setError('');
    try {
      const path = `images/bio-${slug}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
      const r = ref(storage(), path);
      await uploadBytes(r, file);
      await getDownloadURL(r);
      set(slug, { photo: path });
    } catch {
      setError('Upload failed. Check Storage rules allow authenticated writes to images/.');
    } finally {
      setUploading(null);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 40 }}>
      <h1 className="display" style={{ fontSize: 30, margin: 0 }}>Bios</h1>
      <ErrorNote>{error}</ErrorNote>

      {EXPECTED.map(({ slug, name, order }) => {
        const bio = get(slug, name, order);
        const photo = mediaUrl(bio.photo);
        return (
          <div key={slug} style={{ border: '1px solid var(--hairline)', padding: 24, display: 'grid', gap: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-display),serif', fontSize: 22, margin: 0 }}>{name}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Name">
                <Input value={bio.name} onChange={(e) => set(slug, { name: e.target.value })} />
              </Field>
              <Field label="Role (e.g. Director & Co-Founder)">
                <Input value={bio.role} onChange={(e) => set(slug, { role: e.target.value })} />
              </Field>
            </div>

            <Field label="Photo">
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                {photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: '50%', border: '1px solid var(--hairline)' }} />
                )}
                <input
                  type="file" accept="image/*"
                  onChange={(e) => e.target.files?.[0] && uploadPhoto(slug, e.target.files[0])}
                  disabled={uploading === slug}
                />
                {uploading === slug && <span style={{ fontSize: 12, color: 'var(--ash)' }}>Uploading…</span>}
              </div>
            </Field>

            <Field label="Short bio — shown on the homepage card">
              <TextArea rows={3} value={bio.shortBio} onChange={(e) => set(slug, { shortBio: e.target.value })} />
            </Field>

            <Field label="Full bio — shown when someone clicks &ldquo;Read full bio&rdquo;. Separate paragraphs with a blank line.">
              <TextArea rows={10} value={bio.fullBio} onChange={(e) => set(slug, { fullBio: e.target.value })} />
            </Field>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button className="btn" onClick={() => save(slug)} disabled={saving === slug}>
                {saving === slug ? 'Saving' : 'Save'}
              </button>
              {savedAt[slug] && Date.now() - savedAt[slug] < 4000 && (
                <span style={{ color: 'var(--uv-hi)', fontSize: 13 }}>Saved.</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
