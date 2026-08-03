// lib/site.ts
// ---------------------------------------------------------------------------
// Copy that isn't tied to a Firestore-editable collection: site metadata, the
// ticker strip, and the manifesto/stats block. Tour dates live in lib/tour.ts
// (Firestore `tour` + `content/tourMeta`) and founder bios in lib/bios.ts
// (Firestore `bios`) — both editable in /admin. Nothing below is.
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

export const TICKER: string[] = [
  'Wildcards — 15-city tour',
  'Best Narrative Feature, Essence Film Festival 2025',
  'Leon · Elise Neal · Aries Spears',
  'Post-screening talkbacks with the cast',
  'Distributed with Dark Star Pictures',
];

export const MANIFESTO =
  'We build real opportunity for people of color in front of and behind the camera — and we do it by making {commercial} films that matter.';

export const STATS = [
  { value: '5',   label: 'Films in the current cycle' },
  { value: '15',  label: 'Cities on the Wildcards tour' },
  { value: '80+', label: 'Features produced or financed by our founders' },
] as const;
