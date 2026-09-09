import type { Metadata } from 'next';
import TrophyWall from '@/components/TrophyWall';
import PressWall from '@/components/PressWall';
import { db } from '@/lib/firebase';
import { getFilms } from '@/lib/films';
import { getPress, trophiesFromFilms } from '@/lib/press';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Press',
  description: 'Awards, festival recognition, and press coverage for BLacklight films.',
};

export default async function PressPage() {
  // Awards live on each film — flatten them out rather than duplicating
  // data into a second collection. Editing an award in /admin/films updates
  // both the film page and this wall.
  const films = await getFilms(db(), 'blacklight');
  const trophies = trophiesFromFilms(films);
  const press = await getPress(db());

  return (
    <>
      <section className="press-hero">
        <span className="label">Press &amp; recognition</span>
        <h1 className="display">Held up to the light.</h1>
        <p className="press-intro">
          Every award and every piece of coverage BLacklight films have earned, in one place —
          for anyone deciding whether to bet on us next.
        </p>
      </section>

      <section id="coverage">
        <div className="shead rv">
          <span className="label">As seen in</span>
          <h2 className="display">What they&rsquo;re saying.</h2>
        </div>
        <PressWall mentions={press} />
      </section>

      <section id="awards">
        <div className="shead rv">
          <span className="label">Awards</span>
          <h2 className="display">The trophy case.</h2>
          <span className="label count">{String(trophies.length).padStart(2, '0')} to date</span>
        </div>
        <TrophyWall trophies={trophies} />
      </section>

      <section className="press-cta rv">
        <p>
          Press or investor inquiry?{' '}
          <a href="/contact">Get in touch</a> — we&rsquo;ll get back to you directly.
        </p>
      </section>
    </>
  );
}
