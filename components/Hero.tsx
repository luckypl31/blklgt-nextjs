import { storeLink, WILDCARDS_HERO_CTA, WILDCARDS_SLUG } from '@/lib/store-links';

// The thesis. Two identical copies of the headline: a dark ghost that's always
// there (so it's legible with JS off and readable to a screen reader), and a
// lit copy masked to the beam. The lit layer is aria-hidden so the sentence
// isn't announced twice.
//
// CHANGED: two plain, always-lit links sit under the intro. The beam effect
// stays exactly as it was — but a visitor who never moves the pointer (most
// phones) still sees where to go next without scrolling.

const HEAD = ['Some stories only show up under a ', 'different light.'];

export default function Hero() {
  const line = (
    <>
      {HEAD[0]}
      <em>{HEAD[1]}</em>
    </>
  );

  const filmCta =
    WILDCARDS_HERO_CTA === 'watch'
      ? { href: storeLink(`film-${WILDCARDS_SLUG}`, 'hero'), label: 'Watch Wildcards' }
      : { href: '/#tour', label: 'See Wildcards on tour' };

  return (
    <section className="hero">
      <div className="hero-type">
        <h1 className="display hero-h hero-dark">{line}</h1>
        <div className="display hero-h hero-lit" aria-hidden="true">
          {line}
        </div>
      </div>

      <div className="hero-sub">
        <p>
          BLacklight makes <span className="hi">elevated genre films for the culture</span> —
          action, thriller, drama — built at the intersection of cinema and technology.{' '}
          <span className="secret">Move the light. We hid something down here.</span>
        </p>

        <div className="hero-cta">
          <a className="hero-cta-primary" href={filmCta.href}>
            {filmCta.label}
          </a>
          <a className="hero-cta-secondary" href={storeLink('book-collectors', 'hero')}>
            Read the Wildcards screenplay
          </a>
        </div>

        <div className="scrollcue">
          <i />
          Scroll
        </div>
      </div>
    </section>
  );
}
