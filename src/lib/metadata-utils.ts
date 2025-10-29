import { Metadata } from 'next';

import { getFourOhFourData } from '@/lib/cms';

/**
 * Generate 404 metadata from Prismic or fallback
 */
export async function generate404Metadata(locale?: string): Promise<Metadata> {
  try {
    // Fetch 404 page data
    const fourOhFourData = await getFourOhFourData(locale);

    if (fourOhFourData) {
      return {
        title: fourOhFourData.data.meta_title || '404 - Page Not Found',
        description:
          fourOhFourData.data.meta_description ||
          'The page you are looking for could not be found.',
        openGraph: {
          title: fourOhFourData.data.meta_title ?? '404 - Page Not Found',
          description:
            fourOhFourData.data.meta_description ??
            'The page you are looking for could not be found.',
          images: fourOhFourData.data.meta_image?.url
            ? [{ url: fourOhFourData.data.meta_image.url }]
            : [],
        },
      };
    }
  } catch (error) {
    console.error('Error generating 404 metadata:', error);
  }

  // Fallback metadata
  return {
    title: '404 - Page Not Found',
    description: 'The page you are looking for could not be found.',
    openGraph: {
      title: '404 - Page Not Found',
      description: 'The page you are looking for could not be found.',
    },
  };
}
