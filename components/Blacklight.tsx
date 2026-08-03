'use client';

// components/Blacklight.tsx
// ---------------------------------------------------------------------------
// The signature interaction. The cursor is a blacklight; everything masked to
// it lights up.
//
// This runs on every animation frame, so it deliberately never touches React
// state — it writes CSS custom properties on <html> and lets the compositor
// do the rest. Putting the pointer position in useState would re-render the
// entire page 60 times a second for no reason.
//
// Sequence:
//   1. On load, one automatic sweep left-to-right. This isn't decoration —
//      it's how you learn the interaction exists.
//   2. After that, the beam follows the pointer with a little lag.
//   3. On touch (no fine pointer) there's nothing to follow, so it drifts on
//      a slow lissajous so the page is never dark and unreadable.
//   4. reduced-motion: no beam at all. CSS reveals everything statically.
// ---------------------------------------------------------------------------

import { useEffect } from 'react';

export default function Blacklight() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const root = document.documentElement;
    let tx = window.innerWidth * 0.5;
    let ty = window.innerHeight * 0.42;
    let cx = tx;
    let cy = ty;
    let sweeping = true;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      if (sweeping) return;
      tx = e.clientX;
      ty = e.clientY;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    // smoothing loop — the only thing that writes to the DOM
    const tick = () => {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      root.style.setProperty('--mx', `${cx.toFixed(1)}px`);
      root.style.setProperty('--my', `${cy.toFixed(1)}px`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // 1. the teaching sweep
    const y = window.innerHeight * 0.42;
    const from = -320;
    const span = window.innerWidth + 640;
    const dur = 1900;
    let start = 0;
    cx = tx = from;
    cy = ty = y;

    const sweep = (t: number) => {
      if (!start) start = t;
      const p = Math.min((t - start) / dur, 1);
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      tx = from + e * span;
      ty = y;
      if (p < 1) requestAnimationFrame(sweep);
      else {
        sweeping = false;
        drift();
      }
    };
    requestAnimationFrame(sweep);

    // 3. touch fallback
    let driftRaf = 0;
    function drift() {
      if (window.matchMedia('(pointer: fine)').matches) return;
      const t0 = performance.now();
      const loop = (t: number) => {
        const a = (t - t0) / 7000;
        tx = window.innerWidth * (0.5 + 0.34 * Math.cos(a));
        ty = window.innerHeight * (0.42 + 0.14 * Math.sin(a * 1.6));
        driftRaf = requestAnimationFrame(loop);
      };
      driftRaf = requestAnimationFrame(loop);
    }

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(driftRaf);
    };
  }, []);

  return (
    <>
      <div className="uvwash" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
