'use client';

// Scroll-triggered fade-up.
//
// Two failure modes this has to survive, both of which happen constantly in
// real use and neither of which a naive "reveal on enter" observer handles:
//
//   1. The reader JUMPS past a section — clicks an anchor in the nav, hits
//      End, flings a trackpad. The element never intersects, so it never
//      fires, so it stays at opacity 0 forever. The reader scrolls back up to
//      a blank page.
//
//   2. Client-side navigation. Next swaps the page without remounting the
//      layout, so a hook that only observes on mount never sees the new
//      page's nodes at all — every .rv on it is invisible, permanently.
//
// Fixes: re-observe on every pathname change, and treat ""scrolled past" as
// "reveal it now, no animation". You never animate something the reader has
// already gone by.

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function useReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.rv:not(.on)'));
    if (!nodes.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach((n) => n.classList.add('on'));
      return;
    }

    let stagger = 0;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;

          if (entry.isIntersecting) {
            const delay = stagger++ * 70;
            window.setTimeout(() => el.classList.add('on'), delay);
            io.unobserve(el);
          } else if (entry.boundingClientRect.bottom < 0) {
            // Above the viewport: the reader has passed it. Show it flat.
            el.classList.add('on');
            io.unobserve(el);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );

    nodes.forEach((n) => io.observe(n));

    // Backstop for jumps.
    //
    // If an element goes from below the viewport to above it in a single jump
    // — anchor link, End key, trackpad fling — its intersection ratio is 0
    // before and 0 after. No threshold is crossed, so IntersectionObserver
    // never fires for it at all and it stays invisible forever. Nothing about
    // the observer config fixes that; it needs a scroll check.
    //
    // rAF-throttled, and it removes itself once every node has revealed, so
    // it costs nothing for the rest of the session.
    let remaining = nodes.slice();
    let queued = false;

    const sweep = () => {
      queued = false;
      remaining = remaining.filter((el) => {
        if (el.classList.contains('on')) return false;
        if (el.getBoundingClientRect().bottom < 0) {
          el.classList.add('on'); // passed by — show it flat, no animation
          io.unobserve(el);
          return false;
        }
        return true;
      });
      if (!remaining.length) window.removeEventListener('scroll', onScroll);
    };

    const onScroll = () => {
      stagger = 0; // fresh burst for the next section
      if (queued) return;
      queued = true;
      requestAnimationFrame(sweep);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    sweep(); // catch anything already above the fold on load (restored scroll)

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [pathname]);
}

export default function Reveal({
  as: Tag = 'div',
  className = '',
  children,
  ...rest
}: {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
  [key: string]: unknown;
}) {
  return (
    <Tag className={`rv ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}
