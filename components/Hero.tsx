// The thesis. Two identical copies of the headline: a dark ghost that's always
// there (so it's legible with JS off and readable to a screen reader), and a
// lit copy masked to the beam. The lit layer is aria-hidden so the sentence
// isn't announced twice.

const HEAD = ['Some stories only show up under a ', 'different light.'];

export default function Hero() {
  const line = (
    <>
      {HEAD[0]}
      <em>{HEAD[1]}</em>
    </>
  );

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
          BLacklight makes <span className="hi">elevated genre films with Black leads</span> —
          action, thriller, drama — built at the intersection of cinema and technology.{' '}
          <span className="secret">Move the light. We hid something down here.</span>
        </p>
        <div className="scrollcue">
          <i />
          Scroll
        </div>
      </div>
    </section>
  );
}
