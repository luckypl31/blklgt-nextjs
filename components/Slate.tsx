'use client';

// Horizontal rail with drag-to-scroll. Scroll-snap does the work; the pointer
// handlers just add mouse dragging, which snap alone doesn't give you.
// Deliberately NOT scroll-jacked — pinning the page to scrub a carousel breaks
// keyboard nav, breaks find-in-page, and makes people feel trapped.

import { useRef } from 'react';
import FilmCard from './FilmCard';
import type { Film } from '@/lib/films';

export default function Slate({ films }: { films: Film[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, x: 0, left: 0 });

  if (!films.length) {
    return (
      <div className="empty">
        <b>No films published yet.</b>
        Add one in the admin console and it appears here and on iamwesmiller.com.
      </div>
    );
  }

  return (
    <>
      <div
        className="rail"
        ref={rail}
        onPointerDown={(e) => {
          drag.current = { down: true, x: e.clientX, left: rail.current?.scrollLeft ?? 0 };
        }}
        onPointerUp={() => { drag.current.down = false; }}
        onPointerLeave={() => { drag.current.down = false; }}
        onPointerMove={(e) => {
          if (!drag.current.down || !rail.current) return;
          rail.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
        }}
      >
        {films.map((f, i) => (
          <FilmCard key={f.slug} film={f} priority={i < 2} />
        ))}
      </div>
      <p className="railhint">Drag to scroll · Hover a title for credits</p>
    </>
  );
}
