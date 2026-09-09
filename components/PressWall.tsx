import type { PressMention } from '@/lib/press';

export default function PressWall({ mentions }: { mentions: PressMention[] }) {
  if (!mentions.length) {
    return (
      <div className="empty">
        <b>No press mentions added yet.</b>
        Add coverage in the admin console — outlet, a short quote, and a link
        — and it appears here.
      </div>
    );
  }

  return (
    <div className="press-grid">
      {mentions.map((m) => (
        <article className="press-card rv" key={m.id}>
          <div className="press-outlet">{m.outlet}</div>
          {m.quote && <p className="press-quote">{m.quote}</p>}
          {m.url && (
            <a href={m.url} target="_blank" rel="noopener noreferrer" className="press-link">
              Read the piece
            </a>
          )}
        </article>
      ))}
    </div>
  );
}
