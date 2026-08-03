import type { MetadataRoute } from 'next';
import { db } from '@/lib/firebase';
import { getFilms } from '@/lib/films';
import { SITE } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const films = await getFilms(db(), 'blacklight');
  return [
    { url: SITE.url, priority: 1 },
    { url: `${SITE.url}/films`, priority: 0.8 },
    ...films.map((f) => ({ url: `${SITE.url}/films/${f.slug}`, priority: 0.7 })),
  ];
}
