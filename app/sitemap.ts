import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const site = SITE_URL;
  const now = new Date();
  return [
    { url: `${site}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${site}/cgv`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${site}/mentions-legales`, lastModified: now, changeFrequency: 'yearly', priority: 0.1 },
    { url: `${site}/confidentialite`, lastModified: now, changeFrequency: 'yearly', priority: 0.1 },
  ];
}
