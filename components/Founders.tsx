import BioCard from './BioCard';
import { db } from '@/lib/firebase';
import { getBios } from '@/lib/bios';

export default async function Founders() {
  const bios = await getBios(db());

  return (
    <section id="about">
      <div className="shead rv">
        <span className="label">Founders</span>
        <h2 className="display">Two people, one bet.</h2>
      </div>

      {bios.length ? (
        <div className="people">
          {bios.map((b) => <BioCard key={b.slug} bio={b} />)}
        </div>
      ) : (
        <div className="empty">
          <b>No bios published yet.</b>
          Add one in the admin console.
        </div>
      )}
    </section>
  );
}
