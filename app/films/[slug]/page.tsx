import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import { getFilm, getFilms, chipText, mediaUrl, type Film } from '@/lib/films';

export const revalidate = 300;

// Pre-render every film at build time. Anything added later is generated on
// first request and cached.
export async function generateStaticParams() {
  const films = await getFilms(db(), 'blacklight');
  return films.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const film = await getFilm(db(), slug);
  if (!film) return { title: 'Not found' };

  const poster = mediaUrl(film.poster);
  return {
    title: `${film.title} (${film.year})`,
    description: film.logline ?? `${film.title} — a BLacklight film.`,
    openGraph: {
      title: `${film.title} (${film.year})`,
      description: film.logline ?? '',
      images: poster ? [poster] : undefined,
    },
  };
}

const CREDITS: [keyof Film, string][] = [
  ['director', 'Director'],
  ['writer', 'Writer'],
  ['starring', 'Cast'],
  ['producers', 'Producers'],
  ['cinematographer', 'Cinematography'],
  ['composer', 'Music'],
  ['distributor', 'Distribution'],
];

export default async function FilmPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const film = await getFilm(db(), slug);
  if (!film || !film.sites?.includes('blacklight')) notFound();

  const poster = mediaUrl(film.poster);
  const primary = film.whereToWatch?.find((w) => w.url);

  return (
    <>
      <div className="film-hero">
        <div className="poster">
          {poster && (
            <Image src={poster} alt={`${film.title} poster`} fill sizes="340px" priority />
          )}
        </div>

        <div>
          <Link className="backlink" href="/films">
            ← All films
          </Link>
          <div>
            <span className={`chip${film.status === 'in-theaters' ? ' now' : ''}`}
                  style={{ position: 'static', display: 'inline-block' }}>
              {chipText(film)}
            </span>
          </div>
          <h1>{film.title}</h1>
          <p className="fmeta" style={{ marginTop: 14 }}>
            {film.year}
            {film.genre && <> <span className="sep">·</span> {film.genre}</>}
          </p>

          {(film.logline || film.synopsis) && (
            <p className="logline">{film.synopsis ?? film.logline}</p>
          )}

          {(primary || film.whereToWatch?.length) && (
            <div className="watch">
              {film.whereToWatch?.filter((w) => w.url).map((w, i) => (
                <a key={w.platform} href={w.url} className={i === 0 ? 'primary' : undefined}>
                  {w.platform}
                </a>
              ))}
              {film.trailerUrl && <a href={film.trailerUrl}>Trailer</a>}
            </div>
          )}

          <dl className="credits">
            {CREDITS.map(([key, label]) => {
              const value = film[key];
              if (!value || typeof value !== 'string') return null;
              return (
                <div className="credit" key={key}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              );
            })}
            {film.awards?.length ? (
              <div className="credit">
                <dt>Awards</dt>
                <dd>
                  <ul className="awards">
                    {film.awards.map((a) => <li key={a}>{a}</li>)}
                  </ul>
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>
    </>
  );
}
