import Link from 'next/link';
import { db } from '@/lib/firebase';
import { getTourStops, getTourMeta } from '@/lib/tour';

export default async function Tour() {
  const [stops, meta] = await Promise.all([getTourStops(db()), getTourMeta(db())]);

  if (!stops.length) {
    return (
      <section id="tour">
        <div className="shead rv">
          <span className="label">On tour</span>
          <h2 className="display">{meta.headline}</h2>
        </div>
        <div className="tour-fallback rv">
          <p>{meta.body}</p>
          {meta.ctaLabel && meta.ctaUrl && (
            <Link className="btn" href={meta.ctaUrl} style={{ display: 'inline-block', marginTop: 18 }}>
              {meta.ctaLabel}
            </Link>
          )}
        </div>
      </section>
    );
  }

  return (
    <section id="tour">
      <div className="shead rv">
        <span className="label">On tour</span>
        <h2 className="display">Come sit with us after.</h2>
        <span className="label count">{stops.length} cities</span>
      </div>

      <div>
        {stops.map((stop) => {
          const pending = stop.status === 'pending';
          return (
            <Link
              key={stop.id}
              className={`tour-row rv${pending ? ' pending' : ''}`}
              href={pending ? '#insider' : (stop.url || '#insider')}
            >
              <span className="d">{stop.date}</span>
              <span className="city">{stop.city}</span>
              <span className="venue">{stop.venue}</span>
              <span className="go">{pending ? 'Notify me' : 'Tickets'}</span>
            </Link>
          );
        })}
      </div>

      <p className="railhint" style={{ marginTop: 28 }}>
        Don&rsquo;t see your city?{' '}
        <a href="#insider" style={{ color: 'var(--uv-hi)', borderBottom: '1px solid currentColor' }}>
          Request a screening
        </a>{' '}
        — that&rsquo;s how we pick the next ones.
      </p>
    </section>
  );
}
