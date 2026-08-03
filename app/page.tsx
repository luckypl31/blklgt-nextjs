import Hero from '@/components/Hero';
import Ticker from '@/components/Ticker';
import Slate from '@/components/Slate';
import Manifesto from '@/components/Manifesto';
import Tour from '@/components/Tour';
import Founders from '@/components/Founders';
import Insider from '@/components/Insider';
import { db } from '@/lib/firebase';
import { getFilms, chipText } from '@/lib/films';

// Server-rendered, revalidated every 5 minutes. Admin edits land without a
// redeploy, and the slate is in the HTML for crawlers — which matters, because
// press and programmers find these pages through search.
export const revalidate = 300;

export default async function Home() {
  const films = await getFilms(db(), 'blacklight');
  const now = films.find((f) => f.status === 'in-theaters');

  return (
    <>
      <Hero />
      <Ticker live={now ? chipText(now) : undefined} />

      <section id="slate">
        <div className="shead rv">
          <span className="label">The slate</span>
          <h2 className="display">
            {films.length} film{films.length === 1 ? '' : 's'}. 4 The Culture.
          </h2>
          <span className="label count">
            01 — {String(films.length).padStart(2, '0')}
          </span>
        </div>
        <Slate films={films} />
      </section>

      <Manifesto />
      <Tour />
      <Founders />
      <Insider />
    </>
  );
}
