import Link from 'next/link';
import Medal from './Medal';
import type { Trophy } from '@/lib/press';

export default function TrophyWall({ trophies }: { trophies: Trophy[] }) {
  if (!trophies.length) {
    return (
      <div className="empty">
        <b>No awards on the board yet.</b>
        Add one to a film in the admin console and it shows up here automatically.
      </div>
    );
  }

  return (
    <div className="trophy-grid">
      {trophies.map((t) => (
        <article className="trophy rv" key={t.id}>
          <div className="trophy-medal"><Medal /></div>
          <h3>{t.title}</h3>
          {t.subtitle && <p className="trophy-sub">{t.subtitle}</p>}
          <Link href={`/films/${t.filmSlug}`} className="trophy-film">
            {t.filmTitle}
          </Link>
        </article>
      ))}
    </div>
  );
}
