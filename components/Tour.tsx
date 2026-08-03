import Link from 'next/link';
import { TOUR } from '@/lib/site';

export default function Tour() {
  return (
    <section id="tour">
      <div className="shead rv">
        <span className="label">Wildcards tour</span>
        <h2 className="display">Come sit with us after.</h2>
        <span className="label count">Aug — Sep 2026</span>
      </div>

      <div>
        {TOUR.map((stop) => {
          const pending = stop.status === 'pending';
          return (
            <Link
              key={`${stop.city}-${stop.date}`}
              className={`tour-row rv${pending ? ' pending' : ''}`}
              href={pending ? '#insider' : (stop.url ?? 'https://wildcardslive.com')}
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
        <a
          href="https://wildcardslive.com"
          style={{ color: 'var(--uv-hi)', borderBottom: '1px solid currentColor' }}
        >
          Request a screening
        </a>{' '}
        — that&rsquo;s how we pick the next ones.
      </p>
    </section>
  );
}
