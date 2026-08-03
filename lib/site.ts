// lib/site.ts
// ---------------------------------------------------------------------------
// Copy and tour dates. Deliberately NOT in Firestore yet — tour stops change
// a few times a season and a git commit is a fine edit surface for that. Move
// it to a `tour` collection when someone other than Wes needs to update it.
// ---------------------------------------------------------------------------

export const SITE = {
  name: 'BLacklight',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.blklgt.com',
  tagline: 'Elevated genre cinema.',
  description:
    'BLacklight makes elevated genre films with Black leads — action, thriller, drama — built at the intersection of cinema and technology.',
  instagram: 'https://www.instagram.com/blklgtofficial/',
  campaign: 'https://wildcardslive.com',
} as const;

export interface TourStop {
  date: string;      // display string
  iso?: string;      // for sorting / structured data
  city: string;
  venue: string;
  url?: string;
  status: 'onsale' | 'pending';
}

export const TOUR: TourStop[] = [
  { date: 'Aug 28', iso: '2026-08-28', city: 'Richmond, VA',    venue: 'Cultural Arts Center at Glen Allen',         status: 'onsale' },
  { date: 'Aug 29', iso: '2026-08-29', city: 'Greensboro, NC',  venue: 'International Civil Rights Museum',          status: 'onsale' },
  { date: 'Aug 30', iso: '2026-08-30', city: 'Charlotte, NC',   venue: 'Mint Museum Uptown',                         status: 'onsale' },
  { date: 'Sep 17', iso: '2026-09-17', city: 'Chicago, IL',     venue: 'ETA Creative Arts Foundation',               status: 'onsale' },
  { date: 'Sep 18', iso: '2026-09-18', city: 'Detroit, MI',     venue: 'Marygrove Conservancy',                      status: 'onsale' },
  { date: 'Sep 20', iso: '2026-09-20', city: 'Cleveland, OH',   venue: 'Cedar Lee Theatre',                          status: 'onsale' },
  { date: 'Sep 25', iso: '2026-09-25', city: 'Birmingham, AL',  venue: 'Carver Theatre — Alabama Jazz Hall of Fame', status: 'onsale' },
  { date: 'TBA',                        city: 'Memphis, TN',     venue: 'Memphis Brooks Museum of Art',               status: 'pending' },
  { date: 'TBA',                        city: 'Atlanta, GA',     venue: 'Venue to be announced',                      status: 'pending' },
];

export const TICKER: string[] = [
  'Wildcards — 15-city tour',
  'Best Narrative Feature, Essence Film Festival 2025',
  'Leon · Elise Neal · Aries Spears',
  'Post-screening talkbacks with the cast',
  'Distributed with Dark Star Pictures',
];

export const FOUNDERS = [
  {
    name: 'Wes Miller',
    photo: '/people/wes.jpg',
    bio: 'Director and co-founder. A civil rights trial lawyer until 2015, now writing and directing pulpy slices of Americana violence through the eyes of flawed characters. River Runs Red, Hell on the Border, A Day to Die.',
  },
  {
    name: 'Andrew van den Houten',
    photo: '/people/andrew.jpg',
    bio: 'Producer, financier, co-founder. Involved in the development, financing, production or distribution of more than eighty features. Work recognized at Sundance, TIFF, SXSW, the Independent Spirit Awards and Fantastic Fest.',
  },
] as const;

export const MANIFESTO =
  'We build real opportunity for people of color in front of and behind the camera — and we do it by making {commerical} films that matter.';

export const STATS = [
  { value: '5',   label: 'Films in the current cycle' },
  { value: '15',  label: 'Cities on the Wildcards tour' },
  { value: '80+', label: 'Features produced or financed by our founders' },
] as const;
