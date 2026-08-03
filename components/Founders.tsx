import Image from 'next/image';
import { FOUNDERS } from '@/lib/site';

export default function Founders() {
  return (
    <section>
      <div className="shead rv">
        <span className="label">Founders</span>
        <h2 className="display">Two people, one bet.</h2>
      </div>
      <div className="people">
        {FOUNDERS.map((p) => (
          <article className="person rv" key={p.name}>
            <figure data-initials={p.name.split(' ').map((w) => w[0]).join('')}>
              <Image src={p.photo} alt={p.name} fill sizes="(max-width: 900px) 100vw, 46vw" />
            </figure>
            <h3>{p.name}</h3>
            <p>{p.bio}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
