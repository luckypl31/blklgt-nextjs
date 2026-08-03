import Image from 'next/image';
import Link from 'next/link';
import { chipText, mediaUrl, type Film } from '@/lib/films';

function Credits({ film }: { film: Film }) {
  const bits: React.ReactNode[] = [];
  if (film.logline) bits.push(<span key="l">{film.logline} </span>);
  if (film.director) bits.push(<span key="d"><b>Dir.</b> {film.director} · </span>);
  if (film.starring) bits.push(<span key="s"><b>With</b> {film.starring}. </span>);
  if (film.awards?.length) bits.push(<span key="a">{film.awards.join('. ')}.</span>);
  return <>{bits}</>;
}

export default function FilmCard({ film, priority }: { film: Film; priority?: boolean }) {
  const poster = mediaUrl(film.poster);
  const isNow = film.status === 'in-theaters';

  return (
    <article className="film rv">
      <Link href={`/films/${film.slug}`} aria-label={`${film.title}, ${film.year}`}>
        <div className="plate">
          <span className={`chip${isNow ? ' now' : ''}`}>{chipText(film)}</span>
          {poster ? (
            // Poster art already shows the title — overlaying our own text on
            // top just blocks part of the artwork. alt carries the name
            // instead of a visible <h3>.
            <Image
              src={poster}
              alt={film.title}
              fill
              sizes="(max-width: 700px) 80vw, 380px"
              priority={priority}
            />
          ) : (
            // No art yet: center the title like a placeholder one-sheet, so
            // the card still reads as "a poster," just an unfinished one.
            <div className="plate-title-center">
              <h3 className="ftitle">{film.title}</h3>
            </div>
          )}
          <p className="fmeta">
            {film.year}
            {film.genre && (
              <>
                {' '}
                <span className="sep">·</span> {film.genre}
              </>
            )}
          </p>
        </div>
      </Link>
      <div className="fdetail">
        <Credits film={film} />
      </div>
    </article>
  );
}
