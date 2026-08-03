import { TICKER } from '@/lib/site';

// The group is rendered twice and the track slides -50%, so the loop is
// seamless. Duplicating in markup rather than cloning in JS means it's already
// correct in the server-rendered HTML — no flash of a half-empty strip.

export default function Ticker({ live }: { live?: string }) {
  const group = (key: string, hidden?: boolean) => (
    <div className="ticker-group" key={key} aria-hidden={hidden}>
      {live && (
        <span className="ticker-item">
          <span className="live">{live}</span>
        </span>
      )}
      {TICKER.map((t) => (
        <span className="ticker-item" key={t}>
          {t} <span className="sep">/</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="ticker" aria-label="Current releases">
      <div className="ticker-track">
        {group('a')}
        {group('b', true)}
      </div>
    </div>
  );
}
