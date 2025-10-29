import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { CustomSliceZone } from '@/components/custom-slice-zone';
import {
  extractActualUid,
  generateHreflangUrls,
  getHomePageData,
  validateUrlStructure,
} from '@/lib/cms';
import { parseSlugParams, SUPPORTED_LOCALES } from '@/lib/locales';
import { generate404Metadata } from '@/lib/metadata-utils';
import { createClient } from '@/prismicio';

type Params = { slug?: string[] };

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const { locale, uid } = parseSlugParams(slug);

  // Extract the actual page UID from URL slug segments
  const actualUid = extractActualUid(uid, slug);

  const client = createClient();
  const page = await client
    .getByUID('page', actualUid, { lang: locale })
    .catch(() => notFound());

  // Validate URL structure for pages with parents
  if (!validateUrlStructure(page, slug, locale)) {
    return notFound();
  }

  // Fetch home page data for breadcrumbs
  const homePageData = await getHomePageData(locale);

  // Custom SliceZone implementation that passes index to each slice
  return (
    <>
      <Breadcrumbs
        currentPage={page}
        homePageData={homePageData}
        locale={locale}
      />
      <CustomSliceZone
        slices={page.data.slices}
        context={{
          stripe_product_id: page.data.stripe_product_id,
          sizes: page.data.sizes,
          previous_price: page.data.previous_price,
          locale: locale,
        }}
      />
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const { locale, uid } = parseSlugParams(slug);

    // Extract the actual page UID from URL slug segments
    const actualUid = extractActualUid(uid, slug);

    const client = createClient();
    const page = await client.getByUID('page', actualUid, { lang: locale });

    // Validate URL structure for pages with parents
    if (!validateUrlStructure(page, slug, locale)) {
      // URL structure is invalid, return 404 metadata
      return await generate404Metadata(locale);
    }

    // Generate hreflang URLs for all supported locales
    const hreflangUrls = await generateHreflangUrls(page, locale);

    return {
      title: page.data.meta_title,
      description: page.data.meta_description,
      openGraph: {
        title: page.data.meta_title ?? undefined,
        images: [{ url: page.data.meta_image.url ?? '' }],
      },
      alternates: {
        canonical: hreflangUrls.find((h) => h.lang === locale)?.url || '/',
        languages: Object.fromEntries(
          hreflangUrls.map(({ lang, url }) => [lang, url])
        ),
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);

    // Return 404 metadata for any errors (including page not found)
    return await generate404Metadata();
  }
}

export async function generateStaticParams() {
  const client = createClient();

  // Get all pages from Prismic
  const pages = await client.getAllByType('page');

  const params: Array<{ slug?: string[] }> = [];

  for (const page of pages) {
    if (page.uid === 'home') {
      // Home page: no slug (empty array means root path)
      params.push({ slug: undefined });
      // Also add locale-specific home page paths
      SUPPORTED_LOCALES.forEach((locale) => {
        params.push({ slug: [locale] });
      });
    } else {
      // Check if this page has a parent
      if (
        page.data.parent &&
        'uid' in page.data.parent &&
        page.data.parent.uid
      ) {
        // Page has a parent: create nested URL
        params.push({ slug: [page.data.parent.uid, page.uid] });
      } else {
        // Page has no parent: single slug segment
        params.push({ slug: [page.uid] });
      }
    }
  }

  return params;
}
