// scripts/seed-content.ts
// ---------------------------------------------------------------------------
// One-time bootstrap for tour + bios, so the site isn't showing empty states
// the moment the new sections go live. After this runs, everything here is
// editable in /admin — this script is a starting point, not a source of
// truth you re-run.
//
//   npm run seed:content
//
// Needs serviceAccount.json (see scripts/migrate-admin.ts for how to get one).
// Safe to re-run — merge:true, so it won't clobber anything already edited
// in the admin console.
// ---------------------------------------------------------------------------

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const KEY_PATH = process.env.SERVICE_ACCOUNT ?? resolve(process.cwd(), 'serviceAccount.json');

const TOUR_STOPS = [
  { id: 'richmond-va',   date: 'Aug 28', iso: '2026-08-28', city: 'Richmond, VA',   venue: 'Cultural Arts Center at Glen Allen',         status: 'onsale',  order: 1 },
  { id: 'greensboro-nc', date: 'Aug 29', iso: '2026-08-29', city: 'Greensboro, NC', venue: 'International Civil Rights Museum',          status: 'onsale',  order: 2 },
  { id: 'charlotte-nc',  date: 'Aug 30', iso: '2026-08-30', city: 'Charlotte, NC',  venue: 'Mint Museum Uptown',                         status: 'onsale',  order: 3 },
  { id: 'chicago-il',    date: 'Sep 17', iso: '2026-09-17', city: 'Chicago, IL',    venue: 'ETA Creative Arts Foundation',               status: 'onsale',  order: 4 },
  { id: 'detroit-mi',    date: 'Sep 18', iso: '2026-09-18', city: 'Detroit, MI',    venue: 'Marygrove Conservancy',                      status: 'onsale',  order: 5 },
  { id: 'cleveland-oh',  date: 'Sep 20', iso: '2026-09-20', city: 'Cleveland, OH',  venue: 'Cedar Lee Theatre',                          status: 'onsale',  order: 6 },
  { id: 'birmingham-al', date: 'Sep 25', iso: '2026-09-25', city: 'Birmingham, AL', venue: 'Carver Theatre — Alabama Jazz Hall of Fame', status: 'onsale',  order: 7 },
  { id: 'memphis-tn',    date: 'TBA',                       city: 'Memphis, TN',    venue: 'Memphis Brooks Museum of Art',               status: 'pending', order: 8 },
  { id: 'atlanta-ga',    date: 'TBA',                       city: 'Atlanta, GA',    venue: 'Venue to be announced',                       status: 'pending', order: 9 },
];

const TOUR_META = {
  headline: 'The next tour is being routed.',
  body: "We take every film on the road — post-screening talkbacks, local partners, the whole thing. Join the Society and you'll hear about the next city before anyone else.",
  ctaLabel: 'Join the Society',
  ctaUrl: '#insider',
};

const BIOS = [
  {
    slug: 'wes',
    name: 'Wes Miller',
    role: 'Director & Co-Founder',
    photo: '/people/wes.jpg',
    order: 1,
    shortBio:
      'Director and co-founder. A civil rights trial lawyer until 2015, now writing and directing pulpy slices of Americana violence through the eyes of flawed characters.',
    fullBio: `Wes is a filmmaker and co-founder of production company BLacklight. Through both BLacklight and Miller's past work, he is focused on both diversity and inclusion in front of and behind the camera, with a dedication to exploring the ongoing social and cultural problems in America. He specializes in exploring pulpy slices of Americana violence through the eyes of flawed characters. Miller was raised in Memphis, TN, where he was a three sport athlete. He attended college at Lambuth University (now University of Memphis-Lambuth) and was an All Conference cornerback. His life's journey next took him to law school.

After raising his son as a single father and graduating towards the top of his law school class, Miller worked as a civil rights trial lawyer and completely left the practice of law in 2015 and began honing his skills as a visual storyteller. His 2016 release, "Prayer Never Fails" was nominated for awards at several festivals including the Long Beach International Film Festival. His 2018 release, "River Runs Red" starring Taye Diggs, George Lopez and John Cusack has won numerous awards including Best Dramatic Film at the Downtown Los Angeles Film Festival. His next film, the western, "Hell on the Border" starring David Gyasi, Ron Perlman and Frank Grillo screened at multiple film festivals and for multiple Historically Black Colleges and Universities. Miller was also awarded Best Director of an Independent Film in 2020 at the Hollywood & African Prestigious Awards (HAPA) for his 2019 film release "Atone." In 2022 Miller's action film "A Day To Die" released starring Bruce Willis, Leon, Frank Grillo, and Kevin Dillon.

His current film work is all through his newly formed company BLacklight, with "Call Her King" starring Naturi Naughton, Lance Gross, Jason Mitchell and Nick Turturro, released in 2023 on BET+.

"Black Heat" starring Jason Mitchell, Tabatha "DreamDoll" Robinson and NLE Choppa marks Miller's second BLacklight release and his largest to date with a national theatrical release. In addition to producing the film, BLacklight is also the distributor of the film in partnership with Dark Star Pictures.

Miller is currently in post on three new BLacklight films that he has written and directed in the last several months.`,
  },
  {
    slug: 'andrew',
    name: 'Andrew van den Houten',
    role: 'Producer & Co-Founder',
    photo: '/people/andrew.jpg',
    order: 2,
    shortBio:
      'Producer, financier, co-founder. Involved in the development, financing, production or distribution of more than eighty features. Work recognized at Sundance, TIFF, SXSW, the Independent Spirit Awards and Fantastic Fest.',
    fullBio: `Andrew van den Houten is an award-winning director, producer, and financier whose work has been recognized by the Sundance Film Festival, Toronto International Film Festival, Independent Spirit Awards, SXSW, Fantastic Fest, Sitges, FrightFest, and many others. Receiving critical acclaim from the likes of Stephen King and Roger Ebert, he has been involved in the development, financing, production, and distribution of more than eighty feature films.

Raised on Manhattan's Upper West Side, van den Houten began his directing career through Modernciné, where he directed Headspace and Offspring while producing acclaimed films including Independent Spirit Award nominee In the Family, Jack Ketchum's The Girl Next Door, and the Sundance shocker The Woman.

Through Hood River Entertainment, van den Houten has produced a diverse slate of films including the Shudder Original The Ranger, the critically acclaimed The Block Island Sound, and A Day to Die, directed by Wes Miller and starring Bruce Willis.

Together with director Wes Miller, van den Houten co-founded BLacklight, a production company committed to creating meaningful opportunities for people of color and other traditionally underserved voices while producing commercially successful and globally resonant stories.

BLacklight's productions include BET's Call Her King, starring Naturi Naughton and Lance Gross. In partnership with Dark Star Pictures, BLacklight also serves as a distribution and releasing partner on Black Heat, starring Jason Mitchell, NLE Choppa, and DreamDoll, and the upcoming releases Wildcards, starring Leon, Aries Spears, and Elise Neal; Bloody Night, starring Leon, Hannaha Hall, NLE Choppa, and Jack Wright; and Mercy Mercy Me, the prequel to Black Heat starring Lil Mama and Jason Mitchell.`,
  },
];

async function main() {
  let serviceAccount: Record<string, string>;
  try {
    serviceAccount = JSON.parse(readFileSync(KEY_PATH, 'utf8'));
  } catch {
    console.error(`\nNo service account key at ${KEY_PATH}.\nSee scripts/migrate-admin.ts for how to generate one.\n`);
    process.exit(1);
  }

  initializeApp({ credential: cert(serviceAccount as never) });
  const db = getFirestore();
  const batch = db.batch();

  TOUR_STOPS.forEach((stop) => {
    const { id, ...rest } = stop;
    batch.set(db.collection('tour').doc(id), rest, { merge: true });
  });

  batch.set(db.collection('content').doc('tourMeta'), TOUR_META, { merge: true });

  BIOS.forEach((bio) => {
    const { slug, ...rest } = bio;
    batch.set(db.collection('bios').doc(slug), rest, { merge: true });
  });

  await batch.commit();
  console.log(`\nSeeded ${TOUR_STOPS.length} tour stops, the tour fallback message, and ${BIOS.length} bios.`);
  console.log('Everything here is editable in /admin from now on.\n');
  process.exit(0);
}

main().catch((e) => {
  console.error('\nSeed failed:', e?.message ?? e);
  process.exit(1);
});
