import { MetadataRoute } from 'next';

import { generateHreflangUrls } from '@/lib/cms';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/lib/locales';
import { createClient } from '@/prismicio';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const client = createClient();
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Get all pages from Prismic
  const pages = await client.getAllByType('page');

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Add static pages
  sitemapEntries.push({
    url: `${SITE_URL}/`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  });

  // Add locale-specific home pages
  SUPPORTED_LOCALES.forEach((locale) => {
    if (locale !== DEFAULT_LOCALE) {
      sitemapEntries.push({
        url: `${SITE_URL}/${locale}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      });
    }
  });

  // Add all other pages
  for (const page of pages) {
    if (page.uid === 'home') {
      // Skip home page as it's already added above
      continue;
    }

    // Use the existing generateHreflangUrls function to get all language versions
    const hreflangUrls = await generateHreflangUrls(page, page.lang);

    // Add all language versions to sitemap
    for (const hreflangUrl of hreflangUrls) {
      // Skip x-default as it's not a real URL
      if (hreflangUrl.lang === 'x-default') continue;

      // Find the corresponding page data for this language
      let pageData = page;
      if (hreflangUrl.lang !== page.lang) {
        try {
          // Find the alternate language page
          const altLang = page.alternate_languages?.find(
            (alt) => alt.lang === hreflangUrl.lang
          );
          if (altLang?.uid) {
            pageData = await client.getByUID('page', altLang.uid, {
              lang: hreflangUrl.lang,
            });
          }
        } catch (error) {
          console.warn(
            `Failed to fetch alternate page data for ${hreflangUrl.lang}:`,
            error
          );
        }
      }

      sitemapEntries.push({
        url: hreflangUrl.url,
        lastModified: new Date(pageData.last_publication_date),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  return sitemapEntries;
}
