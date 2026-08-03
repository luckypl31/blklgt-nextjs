'use client';

// Mounts the shared observer once per page. Server components can then just
// put className="rv" on anything and it works.

import { useReveal } from './Reveal';

export default function RevealRoot() {
  useReveal();
  return null;
}
