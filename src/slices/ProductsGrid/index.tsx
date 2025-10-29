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
import { useStripeProductsBatch } from '@/hooks/use-stripe-products-batch';
import { cn, hasSectionIntroContent } from '@/lib/utils';
import { createClient } from '@/prismicio';

import { ProductCard, ProductCardSkeleton } from './ProductCard';

import type { ExtendedSliceProps } from '@/components/custom-slice-zone';

/**
 * Props for `ProductsGrid`.
 */
export type ProductsGridProps = SliceComponentProps<Content.ProductsGridSlice> &
  ExtendedSliceProps;

/**
 * Component for "ProductsGrid" Slices.
 */
const ProductsGrid: FC<ProductsGridProps> = ({ slice, context }) => {
  const {
    callout,
    title,
    description,
    buttons,
    tinted_background,
    products,
    tag_to_fetch_from,
    cta_button_label,
    parent_to_fetch_from,
    items_to_fetch,
    load_more_button_label,
  } = slice.primary;

  const [allProducts, setAllProducts] = useState<Content.PageDocument[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<
    Content.PageDocument[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  const itemsPerPage = 8;
  const hasIntroContent = hasSectionIntroContent(slice);

  // Extract Stripe product IDs from displayed products
  const stripeProductIds = displayedProducts
    .map((product) => product.data.stripe_product_id)
    .filter((id): id is string => Boolean(id));

  // Batch fetch Stripe product data
  const {
    data: stripeProducts,
    loading: stripeLoading,
    errors: stripeErrors,
  } = useStripeProductsBatch(stripeProductIds, context?.locale as string);

  // Fetch and process products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      let productsToDisplay: Content.PageDocument[] = [];

      // If products are manually selected, use those
      if (isFilled.group(products)) {
        try {
          const client = createClient();
          const productPages = await Promise.all(
            products
              .filter((item) => isFilled.contentRelationship(item.product))
              .map(async (item) => {
                const filledLink =
                  item.product as prismic.FilledContentRelationshipField;
                const linkedPage = (await client.getByID(
                  filledLink.id
                )) as Content.PageDocument;
                return linkedPage;
              })
          );
          productsToDisplay = productPages;
        } catch (error) {
          console.error('Error fetching selected products:', error);
        }
      }

      // If no manual products or no results, try fetching by tag
      if (
        productsToDisplay.length === 0 &&
        isFilled.contentRelationship(tag_to_fetch_from)
      ) {
        try {
          const client = createClient();
          const pages = await client.getAllByType('page', {
            predicates: [prismic.filter.has('my.page.tag')],
            orderings: [
              {
                field: 'my.page.publish_date',
                direction: 'desc',
              },
            ],
            limit: 100,
          });

          const filteredPages = pages.filter(
            (page) =>
              page.data.tag &&
              'id' in page.data.tag &&
              page.data.tag.id === tag_to_fetch_from.id
          );

          // Apply the items limit if specified
          const itemsLimit = isFilled.number(items_to_fetch)
            ? items_to_fetch
            : 100;
          productsToDisplay = filteredPages.slice(0, itemsLimit);
        } catch (error) {
          console.error('Error fetching products by tag:', error);
        }
      }

      // If still no results, try fetching by parent
      if (
        productsToDisplay.length === 0 &&
        isFilled.keyText(parent_to_fetch_from)
      ) {
        try {
          const client = createClient();
          const pages = await client.getAllByType('page', {
            predicates: [prismic.filter.has('my.page.parent')],
            orderings: [
              {
                field: 'my.page.publish_date',
                direction: 'desc',
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

          // Apply the items limit if specified
          const itemsLimit = isFilled.number(items_to_fetch)
            ? items_to_fetch
            : 100;
          productsToDisplay = filteredPages.slice(0, itemsLimit);
        } catch (error) {
          console.error('Error fetching products by parent:', error);
        }
      }

      setAllProducts(productsToDisplay);
      setHasMore(productsToDisplay.length > itemsPerPage);
      setIsLoading(false);
    };

    fetchProducts();
  }, [products, tag_to_fetch_from, parent_to_fetch_from, items_to_fetch]);

  // Update displayed products when currentPage or allProducts changes
  useEffect(() => {
    const endIndex = currentPage * itemsPerPage;
    setDisplayedProducts(allProducts.slice(0, endIndex));
    setHasMore(endIndex < allProducts.length);
  }, [currentPage, allProducts]);

  const loadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const itemCount = displayedProducts.length;

  // Dynamic grid columns based on number of items
  const getGridCols = () => {
    if (itemCount === 1) return 'grid-cols-1 max-w-3xl mx-auto';
    if (itemCount === 2) return 'grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto';
    if (itemCount === 3)
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto';
    if (itemCount === 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  };

  // Dynamic grid columns for skeleton based on expected items
  const getSkeletonGridCols = (count: number) => {
    if (count === 1) return 'grid-cols-1 max-w-3xl mx-auto';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto';
    if (count === 3)
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto';
    if (count === 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  };

  if (isLoading) {
    const skeletonCount = isFilled.number(items_to_fetch) ? items_to_fetch : 8;
    const skeletonItems = Array.from({ length: skeletonCount }, (_, index) => (
      <ProductCardSkeleton key={index} />
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

        {/* Products Grid */}
        {displayedProducts.length > 0 && (
          <>
            <div className={cn('grid gap-4', getGridCols())}>
              {displayedProducts.map((product) => {
                const stripeProductId = product.data.stripe_product_id;
                const stripeProductData = stripeProductId
                  ? stripeProducts[stripeProductId]
                  : undefined;
                const stripeError = stripeProductId
                  ? stripeErrors[stripeProductId]
                  : undefined;

                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    ctaButtonLabel={cta_button_label || undefined}
                    locale={context?.locale as string}
                    stripeProduct={stripeProductData}
                    stripeLoading={stripeLoading}
                    stripeError={stripeError}
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

export default ProductsGrid;
