'use client';

// The short bio is always visible. Clicking it opens the full text in place
// — no navigation, no separate page, no scroll position lost. The height
// animates on a measured pixel value rather than max-height:9999px, so the
// transition timing is consistent instead of racing to an arbitrary ceiling.

import { useRef, useState, useLayoutEffect } from 'react';
import Image from 'next/image';
import type { Bio } from '@/lib/bios';
import { mediaUrl } from '@/lib/films';

function paragraphs(text: string) {
  return text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
}

export default function BioCard({ bio }: { bio: Bio }) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (bodyRef.current) setHeight(bodyRef.current.scrollHeight);
  }, [open, bio.fullBio]);

  const photo = mediaUrl(bio.photo) ?? bio.photo;
  const initials = bio.name.split(' ').map((w) => w[0]).join('');

  return (
    <article className="person rv">
      <figure data-initials={initials}>
        {photo && <Image src={photo} alt={bio.name} fill sizes="(max-width: 900px) 100vw, 46vw" />}
      </figure>
      <h3>{bio.name}</h3>
      {bio.role && <p className="fmeta" style={{ margin: '2px 0 12px' }}>{bio.role}</p>}
      <p>{bio.shortBio}</p>

      {bio.fullBio && bio.fullBio.trim() !== bio.shortBio.trim() && (
        <>
          <div
            className="bio-expand"
            style={{ height: open ? height : 0 }}
            aria-hidden={!open}
          >
            <div ref={bodyRef} className="bio-full">
              {paragraphs(bio.fullBio).map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>

          <button
            className="bio-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            {open ? 'Show less' : 'Read full bio'}
            <span aria-hidden="true">{open ? '−' : '+'}</span>
          </button>
        </>
      )}
    </article>
  );
}
