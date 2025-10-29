import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/lib/locales';
import { createClient } from '@/prismicio';

import type {
  CookieBannerDocument,
  FooterDocument,
  FourOhFourDocument,
  NavbarDocument,
  PageDocument,
} from '../../prismicio-types';

// Get the site URL from environment variables
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Cache for hreflang URLs to avoid repeated API calls
interface HreflangCacheEntry {
  urls: Array<{ lang: string; url: string }>;
  timestamp: number;
}

const hreflangCache = new Map<string, HreflangCacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Define valid document types
type ValidDocumentTypes =
  | 'navbar'
  | 'footer'
  | 'cookie_banner'
  | 'four_oh_four';

/**
 * Generate a cache key for hreflang URLs
 */
function generateHreflangCacheKey(
  page: PageDocument,
  currentLocale: string
): string {
  return `${page.uid}-${currentLocale}-${page.last_publication_date}`;
}

/**
 * Get cached hreflang URLs if available and not expired
 */
function getCachedHreflangUrls(
  cacheKey: string
): Array<{ lang: string; url: string }> | null {
  const cached = hreflangCache.get(cacheKey);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > CACHE_TTL) {
    // Cache expired, remove it
    hreflangCache.delete(cacheKey);
    return null;
  }

  return cached.urls;
}

/**
 * Cache hreflang URLs
 */
function cacheHreflangUrls(
  cacheKey: string,
  urls: Array<{ lang: string; url: string }>
): void {
  hreflangCache.set(cacheKey, {
    urls,
    timestamp: Date.now(),
  });
}

/**
 * Generate hreflang URLs for all supported locales for a given page
 */
export async function generateHreflangUrls(
  page: PageDocument,
  currentLocale: string
): Promise<Array<{ lang: string; url: string }>> {
  // Generate cache key
  const cacheKey = generateHreflangCacheKey(page, currentLocale);

  // Check cache first
  const cachedUrls = getCachedHreflangUrls(cacheKey);
  if (cachedUrls) {
    return cachedUrls;
  }

  const hreflangUrls: Array<{ lang: string; url: string }> = [];
  const client = createClient();

  // Add the current page
  let currentUrl: string;
  if (page.uid === 'home') {
    // Home page URLs
    if (currentLocale === DEFAULT_LOCALE) {
      currentUrl = `${SITE_URL}/`;
    } else {
      currentUrl = `${SITE_URL}/${currentLocale}`;
    }
  } else {
    // Regular page URLs - build path with parents
    const pathSegments: string[] = [];

    // Add all parent UIDs to the path
    let currentParent = page.data.parent;
    while (currentParent && 'uid' in currentParent && currentParent.uid) {
      pathSegments.unshift(currentParent.uid);
      // Check if the parent has its own parent
      if (currentParent.data?.parent && 'uid' in currentParent.data.parent) {
        currentParent = currentParent.data.parent;
      } else {
        break; // No more parents
      }
    }

    // Add the current page UID
    pathSegments.push(page.uid);

    // Build the URL
    if (currentLocale === DEFAULT_LOCALE) {
      currentUrl = `${SITE_URL}/${pathSegments.join('/')}`;
    } else {
      currentUrl = `${SITE_URL}/${currentLocale}/${pathSegments.join('/')}`;
    }
  }

  hreflangUrls.push({ lang: currentLocale, url: currentUrl });

  // Add alternate languages from Prismic
  if (page.alternate_languages) {
    for (const altLang of page.alternate_languages) {
      if (altLang.lang && altLang.uid) {
        try {
          // Fetch the actual page data for this alternate language
          const altPage = await client.getByUID('page', altLang.uid, {
            lang: altLang.lang,
          });

          // Build the URL for the alternate language
          let url: string;

          if (altPage.uid === 'home') {
            // Home page URLs
            if (altLang.lang === DEFAULT_LOCALE) {
              url = `${SITE_URL}/`;
            } else {
              url = `${SITE_URL}/${altLang.lang}`;
            }
          } else {
            // Regular page URLs - build path with parents
            const pathSegments: string[] = [];

            // Add all parent UIDs to the path
            let currentParent = altPage.data.parent;
            while (
              currentParent &&
              'uid' in currentParent &&
              currentParent.uid
            ) {
              pathSegments.unshift(currentParent.uid);
              // Check if the parent has its own parent
              if (
                currentParent.data?.parent &&
                'uid' in currentParent.data.parent
              ) {
                currentParent = currentParent.data.parent;
              } else {
                break; // No more parents
              }
            }

            // Add the current page UID
            pathSegments.push(altPage.uid);

            // Build the URL
            if (altLang.lang === DEFAULT_LOCALE) {
              url = `${SITE_URL}/${pathSegments.join('/')}`;
            } else {
              url = `${SITE_URL}/${altLang.lang}/${pathSegments.join('/')}`;
            }
          }

          hreflangUrls.push({ lang: altLang.lang, url });
        } catch (error) {
          // If the page doesn't exist in this locale, skip it
          console.warn(
            `Failed to fetch alternate page for ${altLang.lang}:`,
            error
          );
        }
      }
    }
  }

  // For homepage, ensure we have all supported locales even if alternate_languages is empty
  if (
    page.uid === 'home' &&
    (!page.alternate_languages || page.alternate_languages.length === 0)
  ) {
    for (const locale of SUPPORTED_LOCALES) {
      if (locale !== currentLocale) {
        let url: string;
        if (locale === DEFAULT_LOCALE) {
          url = `${SITE_URL}/`;
        } else {
          url = `${SITE_URL}/${locale}`;
        }
        hreflangUrls.push({ lang: locale, url });
      }
    }
  }

  // Add x-default tag pointing to the default language
  const defaultLanguageUrl = hreflangUrls.find(
    (url) => url.lang === DEFAULT_LOCALE
  )?.url;
  if (defaultLanguageUrl) {
    hreflangUrls.push({ lang: 'x-default', url: defaultLanguageUrl });
  }

  // Cache the results
  cacheHreflangUrls(cacheKey, hreflangUrls);

  return hreflangUrls;
}

/**
 * Extract the actual page UID from URL slug segments
 * This handles nested URLs like /om-kumpan-starter/var-historia
 */
export function extractActualUid(uid: string, slug?: string[]): string {
  return uid === 'home'
    ? 'home'
    : slug && slug.length > 0
      ? slug[slug.length - 1]
      : uid;
}

/**
 * Validate if the URL structure is correct for a page with a parent
 * Returns true if the URL structure is valid, false if it should show 404
 */
export function validateUrlStructure(
  page: PageDocument,
  slug?: string[],
  currentLocale?: string
): boolean {
  // If the page has a parent, check if the URL includes the parent
  if (page.data.parent && 'uid' in page.data.parent && page.data.parent.uid) {
    // Check if the URL includes the parent (should be the second-to-last segment)
    const hasCorrectParent = !(
      !slug ||
      slug.length < 2 ||
      slug[slug.length - 2] !== page.data.parent.uid
    );

    if (!hasCorrectParent) {
      return false;
    }
  }

  // If we're not in the default locale, check if the URL segment exists in this locale
  if (
    currentLocale &&
    currentLocale !== DEFAULT_LOCALE &&
    slug &&
    slug.length > 0
  ) {
    const lastSegment = slug[slug.length - 1];

    // Check if the last segment is a UID that should be localized
    // Common UIDs that should have localized slugs
    const uidsThatShouldBeLocalized = ['om-kumpan-starter', 'var-historia'];

    if (uidsThatShouldBeLocalized.includes(lastSegment)) {
      return false; // This will cause a 404 for UID access in non-default locales
    }
  }

  // Pages without parents are always valid
  return true;
}

/**
 * Generic function to fetch any single document from Prismic CMS
 */
export async function getCmsData<T>(
  documentType: ValidDocumentTypes,
  locale?: string
): Promise<T | null> {
  const client = createClient();

  try {
    const data = await client.getSingle(documentType, {
      lang: locale || DEFAULT_LOCALE,
    });
    return data as T;
  } catch (error) {
    // Don't log errors for missing documents as this is expected behavior
    // Only log for actual errors (network issues, etc.)
    if (
      error instanceof Error &&
      error.message.includes('No documents were returned')
    ) {
      // This is expected when a document doesn't exist in the CMS
      return null;
    }
    console.error(`Failed to fetch ${documentType} data:`, error);
    return null;
  }
}

/**
 * Fetch home page data for a specific locale
 */
export async function getHomePageData(
  locale?: string
): Promise<PageDocument | null> {
  const client = createClient();

  try {
    const data = await client.getByUID('page', 'home', {
      lang: locale || DEFAULT_LOCALE,
    });
    return data;
  } catch (error) {
    // Don't log errors for missing documents as this is expected behavior
    if (
      error instanceof Error &&
      error.message.includes('No documents were returned')
    ) {
      return null;
    }
    console.error('Failed to fetch home page data:', error);
    return null;
  }
}

/**
 * Specific helper functions using the generic function
 */
export const getNavbarData = (
  locale?: string
): Promise<NavbarDocument | null> =>
  getCmsData<NavbarDocument>('navbar', locale);

export const getFooterData = (
  locale?: string
): Promise<FooterDocument | null> =>
  getCmsData<FooterDocument>('footer', locale);

export const getCookieBannerData = (
  locale?: string
): Promise<CookieBannerDocument | null> =>
  getCmsData<CookieBannerDocument>('cookie_banner', locale);

export const getFourOhFourData = (
  locale?: string
): Promise<FourOhFourDocument | null> =>
  getCmsData<FourOhFourDocument>('four_oh_four', locale);
