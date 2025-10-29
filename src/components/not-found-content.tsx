import Link from 'next/link';

import { CustomSliceZone } from '@/components/custom-slice-zone';
import { getFourOhFourData } from '@/lib/cms';

interface NotFoundContentProps {
  locale?: string;
}

export async function NotFoundContent({ locale }: NotFoundContentProps) {
  // Fetch 404 page data
  const fourOhFourData = await getFourOhFourData(locale);

  // If no 404 data is found, show a fallback
  if (!fourOhFourData) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-foreground mb-4 text-4xl font-bold">404</h1>
          <p className="text-muted-foreground mb-8">
            The page you are looking for could not be found.
          </p>
          <Link
            href="/"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium"
          >
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  // Render the 404 page with custom SliceZone implementation
  return <CustomSliceZone slices={fourOhFourData.data.slices} context={{}} />;
}
