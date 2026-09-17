import { SITE } from '@/lib/site';

/* Links from blklgt into the Blacklight store. Every link carries UTM tags
   so store analytics can separate blklgt visitors from everyone else.
   (UTM tags, not ?ref=, because the Society app treats ?ref= as an
   affiliate code.) */

/** Must match `metadata.slug` on the film in the admin (same slug as its tour page). */
export const WILDCARDS_SLUG = 'wildcards';

/** 'watch' while Wildcards is rentable in the store. 'tour' while it's only touring. */
export const WILDCARDS_HERO_CTA: 'watch' | 'tour' = 'tour';

export function storeLink(item: string | null, placement: string) {
  const url = new URL(SITE.onDemand, 'https://www.blklightsociety.com');
  if (item) url.searchParams.set('item', item);
  url.searchParams.set('utm_source', 'blklgt');
  url.searchParams.set('utm_medium', 'site');
  url.searchParams.set('utm_campaign', placement);
  return url.toString();
}
