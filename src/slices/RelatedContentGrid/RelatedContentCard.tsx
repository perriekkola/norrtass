import { FC } from 'react';
import {
  Content,
  DateField,
  ImageField,
  isFilled,
  KeyTextField,
} from '@prismicio/client';
import { PrismicNextImage, PrismicNextLink } from '@prismicio/next';
import { ArrowRight } from 'lucide-react';

import { Cursor } from '@/components/motion-primitives/cursor';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Helper function to get background class based on tag color
const getTagBackgroundClass = (color?: string) => {
  switch (color) {
    case 'purple':
      return 'bg-purple-500/15 border-purple-500/20';
    case 'blue':
      return 'bg-blue-500/15 border-blue-500/20';
    case 'green':
      return 'bg-green-500/15 border-green-500/20';
    case 'red':
      return 'bg-red-500/15 border-red-500/20';
    case 'yellow':
      return 'bg-yellow-500/15 border-yellow-500/20';
    case 'orange':
      return 'bg-orange-500/15 border-orange-500/20';
    case 'pink':
      return 'bg-pink-500/15 border-pink-500/20';
    case 'neutral':
      return 'bg-gray-500/15 border-gray-500/20';
    default:
      return 'bg-gray-500/15  border-gray-500/20';
  }
};

// Type for tag content relationship
type TagRelationship = Content.PageDocument['data']['tag'];

interface RelatedContentCardProps {
  page: Content.PageDocument;
  showDates: boolean;
  showTags: boolean;
}

// Reusable cursor component
const CardCursor = () => (
  <Cursor
    attachToParent
    variants={{
      initial: { scale: 0.3, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.3, opacity: 0 },
    }}
    transition={{
      ease: 'easeInOut',
      duration: 0.15,
    }}
  >
    <div className="bg-primary text-primary-foreground flex size-20 items-center justify-center rounded-full shadow-lg">
      <ArrowRight className="size-6" />
    </div>
  </Cursor>
);

// Reusable image component
const CardImage = ({ imageField }: { imageField?: ImageField }) => {
  if (!imageField || !isFilled.image(imageField)) return null;

  return (
    <div className="mb-4 aspect-[4/3] overflow-hidden rounded-2xl">
      <PrismicNextImage
        field={imageField}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 768px) 80vw, 30vw"
      />
    </div>
  );
};

// Reusable metadata component
const CardMetadata = ({
  showDates,
  showTags,
  publishDate,
  firstPublicationDate,
  tag,
}: {
  showDates: boolean;
  showTags: boolean;
  publishDate?: DateField;
  firstPublicationDate?: string;
  tag?: TagRelationship;
}) => {
  if (!showDates && !showTags) return null;

  // Use publish_date if available and filled, otherwise fall back to first_publication_date
  const dateToShow =
    publishDate && isFilled.date(publishDate)
      ? publishDate
      : firstPublicationDate;

  return (
    <div className="text-muted-foreground flex flex-col gap-1.5 text-xs sm:flex-row sm:items-center sm:text-sm">
      {showDates && dateToShow && (
        <>
          <span className="order-1 sm:order-0">
            {new Date(dateToShow).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          {showTags && tag && isFilled.contentRelationship(tag) && (
            <span className="hidden sm:inline">·</span>
          )}
        </>
      )}

      {showTags && tag && isFilled.contentRelationship(tag) && (
        <Badge
          variant="outline"
          className={cn(
            'order-0 sm:order-1',
            getTagBackgroundClass(tag.data?.tag_color)
          )}
        >
          {tag.data?.tag_name}
        </Badge>
      )}
    </div>
  );
};

// Reusable title component
const CardTitle = ({ title }: { title?: KeyTextField }) => {
  if (!isFilled.keyText(title)) return null;

  return (
    <h3 className="line-clamp-2 text-lg leading-tight font-(--bold-text) sm:text-xl">
      {title}
    </h3>
  );
};

// Reusable description component
const CardDescription = ({ description }: { description?: KeyTextField }) => {
  if (!isFilled.keyText(description)) return null;

  return (
    <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
      {description}
    </p>
  );
};

// Reusable content wrapper
const CardContent = ({
  showDates,
  showTags,
  publishDate,
  firstPublicationDate,
  tag,
  title,
  description,
}: {
  showDates: boolean;
  showTags: boolean;
  publishDate?: DateField;
  firstPublicationDate?: string;
  tag?: TagRelationship;
  title?: KeyTextField;
  description?: KeyTextField;
}) => (
  <div className="space-y-2 sm:space-y-3">
    <CardMetadata
      showDates={showDates}
      showTags={showTags}
      publishDate={publishDate}
      firstPublicationDate={firstPublicationDate}
      tag={tag}
    />
    <CardTitle title={title} />
    <CardDescription description={description} />
  </div>
);

export const RelatedContentCard: FC<RelatedContentCardProps> = ({
  page,
  showDates,
  showTags,
}) => {
  return (
    <div className="group relative">
      <CardCursor />
      <PrismicNextLink document={page} className="group block cursor-none">
        <CardImage imageField={page.data.featured_image} />
        <CardContent
          showDates={showDates}
          showTags={showTags}
          publishDate={page.data.publish_date}
          firstPublicationDate={page.first_publication_date}
          tag={page.data.tag}
          title={page.data.page_title}
          description={page.data.page_description}
        />
      </PrismicNextLink>
    </div>
  );
};

// Skeleton component for loading state
export const RelatedContentCardSkeleton: FC<{
  showDates?: boolean;
  showTags?: boolean;
}> = ({ showDates, showTags }) => {
  return (
    <div className="group relative animate-pulse">
      {/* Skeleton Image */}
      <Skeleton className="aspect-[4/3] overflow-hidden rounded-lg" />

      {/* Skeleton Content */}
      <div className="space-y-3 pt-4">
        {/* Skeleton Metadata */}
        {(showDates || showTags) && (
          <div className="flex items-center gap-1.5">
            {(showDates || showTags) && <Skeleton className="h-4 w-20" />}
          </div>
        )}

        {/* Skeleton Title */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
        </div>

        {/* Skeleton Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
};
