'use client';

// The mission statement lights word by word as it enters view. Words are split
// on the server-rendered string so the full sentence is in the HTML for
// crawlers and screen readers; only the opacity is animated.

import { useEffect, useRef, useState } from 'react';
import { MANIFESTO, STATS } from '@/lib/site';

// {braces} mark the emphasised tail
function parse(src: string) {
  const out: { word: string; em: boolean }[] = [];
  src.split(/(\{[^}]*\})/).forEach((chunk) => {
    if (!chunk) return;
    const em = chunk.startsWith('{');
    const text = em ? chunk.slice(1, -1) : chunk;
    text.split(/\s+/).filter(Boolean).forEach((word) => out.push({ word, em }));
  });
  return out;
}

export default function Manifesto() {
  const words = parse(MANIFESTO);
  const ref = useRef<HTMLParagraphElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="manifesto" id="about">
      <div className="mgrid">
        <div>
          <span className="label">Why we exist</span>
          <p className="mani" ref={ref} style={{ marginTop: 22 }}>
            {words.map((w, i) => (
              <span key={i}>
                <span
                  className={`w${on ? ' on' : ''}`}
                  style={{ transitionDelay: on ? `${i * 45}ms` : undefined }}
                >
                  {w.em ? <em>{w.word}</em> : w.word}
                </span>{' '}
              </span>
            ))}
          </p>
        </div>
        <div className="mstats">
          {STATS.map((s) => (
            <div className="stat rv" key={s.label}>
              <b>{s.value}</b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
