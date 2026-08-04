'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SITE } from '@/lib/site';

const LINKS = [
  { href: '/films', label: 'Films' },
  { href: '/#tour', label: 'Tour' },
  { href: SITE.onDemand, label: 'Watch', external: true },
  { href: '/#about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Nav() {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const [uv, setUv] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // The toggle floods the page. It's also the accessible route to the hidden
  // copy for anyone who can't or won't move a pointer around.
  useEffect(() => {
    document.body.classList.toggle('uv', uv);
  }, [uv]);

  return (
    <header className={`nav${stuck ? ' stuck' : ''}`}>
      <Link className="wordmark" href="/">
        <b>BL</b>
        <span>acklight</span>
      </Link>

      <button
        className="menubtn"
        aria-expanded={open}
        aria-controls="navlist"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Close' : 'Menu'}
      </button>

      <ul id="navlist" className={open ? 'open' : undefined}>
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              onClick={() => setOpen(false)}
              {...('external' in l && l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      <button
        className="uvbtn"
        aria-pressed={uv}
        onClick={() => setUv((v) => !v)}
        title="Light the whole page"
      >
        <span className="dot" /> Blacklight
      </button>
    </header>
  );
}
