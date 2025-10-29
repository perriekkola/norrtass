import { Metadata } from 'next';
import { headers } from 'next/headers';

import { NotFoundContent } from '@/components/not-found-content';
import { DEFAULT_LOCALE } from '@/lib/locales';
import { generate404Metadata } from '@/lib/metadata-utils';

export async function generateMetadata(): Promise<Metadata> {
  // Get the language code from middleware headers
  const headersList = await headers();
  const locale = headersList.get('x-locale') || DEFAULT_LOCALE;

  return await generate404Metadata(locale);
}

export default async function NotFound() {
  // Get the language code from middleware headers
  const headersList = await headers();
  const locale = headersList.get('x-locale') || DEFAULT_LOCALE;

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <NotFoundContent locale={locale} />
    </div>
  );
}
