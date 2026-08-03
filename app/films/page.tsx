import type { Metadata } from 'next';
import FilmCard from '@/components/FilmCard';
import { db } from '@/lib/firebase';
import { getFilms } from '@/lib/films';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Films',
  description: 'Every BLacklight film — in theaters, in post, and released.',
};

export default async function FilmsIndex() {
  const films = await getFilms(db(), 'blacklight');

  return (
    <section style={{ paddingTop: 'clamp(120px,16vh,180px)' }}>
      <div className="shead rv">
        <span className="label">Films</span>
        <h2 className="display">Everything we&rsquo;ve made.</h2>
        <span className="label count">{String(films.length).padStart(2, '0')} titles</span>
      </div>

      {films.length ? (
        <div className="filmgrid">
          {films.map((f, i) => (
            <FilmCard key={f.slug} film={f} priority={i < 3} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <b>No films published yet.</b>
          Add one in the admin console and it appears here.
        </div>
      )}
    </section>
  );
}
