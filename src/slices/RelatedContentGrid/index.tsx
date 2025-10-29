'use client';

import { FC, useEffect, useState } from 'react';
import { Content, isFilled } from '@prismicio/client';
import * as prismic from '@prismicio/client';
import { SliceComponentProps } from '@prismicio/react';
import { Plus } from 'lucide-react';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { SectionIntro } from '@/components/section-intro';
import { Button } from '@/components/ui/button';
import { cn, hasSectionIntroContent } from '@/lib/utils';
import { createClient } from '@/prismicio';

import {
  RelatedContentCard,
  RelatedContentCardSkeleton,
} from './RelatedContentCard';

// Define types for content items
type ContentItem = {
  type: 'page';
  data: Content.PageDocument;
};

/**
 * Props for `RelatedContentGrid`.
 */
export type RelatedContentGridProps =
  SliceComponentProps<Content.RelatedContentGridSlice>;

/**
 * Component for "RelatedContentGrid" Slices.
 */
const RelatedContentGrid: FC<RelatedContentGridProps> = ({ slice }) => {
  const {
    callout,
    title,
    description,
    buttons,
    tinted_background,
    featured_content,
    parent_to_fetch_from,
    show_dates,
    show_tags,
    items_to_fetch,
    load_more_button_label,
  } = slice.primary;

  const [allContent, setAllContent] = useState<ContentItem[]>([]);
  const [displayedContent, setDisplayedContent] = useState<ContentItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  const itemsPerPage = 8;
  const hasIntroContent = hasSectionIntroContent(slice);

  // Fetch and process content
  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      let contentToDisplay: ContentItem[] = [];

      // If parent_to_fetch_from is specified, fetch pages from that parent
      if (isFilled.keyText(parent_to_fetch_from)) {
        try {
          const client = createClient();
          const pages = await client.getAllByType('page', {
            predicates: [prismic.filter.has('my.page.parent')],
            orderings: [
              {
                field: 'my.page.publish_date',
                direction: 'asc',
              },
            ],
            limit: 100,
          });

          const filteredPages = pages.filter(
            (page) =>
              page.data.parent &&
              'uid' in page.data.parent &&
              page.data.parent.uid === parent_to_fetch_from
          );

          // Sort pages by date: prioritize publish_date if available, otherwise use first_publication_date
          const sortedPages = filteredPages.sort((a, b) => {
            // Get the effective date for each page
            const getEffectiveDate = (page: Content.PageDocument) => {
              // Use publish_date if it exists and is filled, otherwise use first_publication_date
              if (
                page.data.publish_date &&
                isFilled.date(page.data.publish_date)
              ) {
                return new Date(page.data.publish_date);
              }
              return new Date(page.first_publication_date);
            };

            const dateA = getEffectiveDate(a);
            const dateB = getEffectiveDate(b);

            // Sort in descending order (newest first)
            return dateB.getTime() - dateA.getTime();
          });

          // Apply the items limit if specified
          const itemsLimit = isFilled.number(items_to_fetch)
            ? items_to_fetch
            : 100;
          contentToDisplay = sortedPages.slice(0, itemsLimit).map(
            (page): ContentItem => ({
              type: 'page',
              data: page,
            })
          );
        } catch (error) {
          console.error('Error fetching pages:', error);
        }
      }

      // If no parent fetch or no results, use featured_content
      if (contentToDisplay.length === 0 && isFilled.group(featured_content)) {
        try {
          const client = createClient();
          const featuredPages = await Promise.all(
            featured_content
              .filter((item) => isFilled.contentRelationship(item.link))
              .map(async (item) => {
                // TypeScript now knows item.link is filled, so we can safely access id
                const filledLink =
                  item.link as prismic.FilledContentRelationshipField;
                const linkedPage = (await client.getByID(
                  filledLink.id
                )) as Content.PageDocument;
                return {
                  type: 'page' as const,
                  data: linkedPage,
                };
              })
          );
          contentToDisplay = featuredPages;
        } catch (error) {
          console.error('Error fetching featured content:', error);
        }
      }

      setAllContent(contentToDisplay);
      setHasMore(contentToDisplay.length > itemsPerPage);
      setIsLoading(false);
    };

    fetchContent();
  }, [parent_to_fetch_from, featured_content, items_to_fetch]);

  // Update displayed content when currentPage or allContent changes
  useEffect(() => {
    const endIndex = currentPage * itemsPerPage;
    setDisplayedContent(allContent.slice(0, endIndex));
    setHasMore(endIndex < allContent.length);
  }, [currentPage, allContent]);

  const loadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const itemCount = displayedContent.length;

  // Dynamic grid columns based on number of items
  const getGridCols = () => {
    if (itemCount === 1) return 'grid-cols-1 max-w-3xl mx-auto';
    if (itemCount === 2) return 'grid-cols-2 max-w-6xl mx-auto';
    if (itemCount === 3) return 'grid-cols-2 max-w-6xl mx-auto';
    if (itemCount === 4) return 'grid-cols-2 lg:grid-cols-4';
    return 'grid-cols-2 lg:grid-cols-4';
  };

  // Dynamic grid columns for skeleton based on expected items
  const getSkeletonGridCols = (count: number) => {
    if (count === 1) return 'grid-cols-1 max-w-3xl mx-auto';
    if (count === 2) return 'grid-cols-2 max-w-6xl mx-auto';
    if (count === 3) return 'grid-cols-2 max-w-6xl mx-auto';
    if (count === 4) return 'grid-cols-2 lg:grid-cols-4';
    return 'grid-cols-2 lg:grid-cols-4';
  };

  if (isLoading) {
    const skeletonCount = isFilled.number(items_to_fetch) ? items_to_fetch : 8;
    const skeletonItems = Array.from({ length: skeletonCount }, (_, index) => (
      <RelatedContentCardSkeleton
        key={index}
        showDates={show_dates}
        showTags={show_tags}
      />
    ));

    return (
      <Section
        data-slice-type={slice.slice_type}
        data-slice-variation={slice.variation}
        tintedBackground={tinted_background}
      >
        <Container>
          {hasIntroContent && (
            <SectionIntro
              callout={callout}
              title={title}
              description={description}
              buttons={buttons}
              align="center"
              className="relative z-10 mb-10 lg:mb-16"
            />
          )}
          <div className={cn('grid gap-4', getSkeletonGridCols(skeletonCount))}>
            {skeletonItems}
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      tintedBackground={tinted_background}
    >
      <Container>
        {/* Intro */}
        {hasIntroContent && (
          <SectionIntro
            callout={callout}
            title={title}
            description={description}
            buttons={buttons}
            align="center"
            className="relative z-10 mb-10 lg:mb-16"
          />
        )}

        {/* Content Grid */}
        {displayedContent.length > 0 && (
          <>
            <div className={cn('grid gap-4', getGridCols())}>
              {displayedContent.map((item) => {
                return (
                  <RelatedContentCard
                    key={item.data.id}
                    page={item.data}
                    showDates={show_dates}
                    showTags={show_tags}
                  />
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-12 flex justify-center">
                <Button
                  className="cursor-pointer"
                  onClick={loadMore}
                  variant="outline"
                  size="lg"
                >
                  <Plus />
                  {load_more_button_label || 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </Container>
    </Section>
  );
};

export default RelatedContentGrid;
