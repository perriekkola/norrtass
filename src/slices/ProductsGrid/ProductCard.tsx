import { FC, useState } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { PrismicNextImage, PrismicNextLink } from '@prismicio/next';
import { ArrowRight, Image, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/contexts/cart-context';
import { formatPrice } from '@/lib/utils';

import { SizeSelectionModal } from './SizeSelectionModal';

interface StripeProductData {
  product: {
    id: string;
    name: string;
    description: string | null;
    images: string[];
    metadata: Record<string, string>;
  };
  price: {
    id: string;
    amount: number | null;
    currency: string;
    formatted: string;
  };
}

export type ProductCardProps = {
  product: Content.PageDocument;
  ctaButtonLabel?: string;
  locale?: string;
  stripeProduct?: StripeProductData;
  stripeLoading?: boolean;
  stripeError?: string;
};

export const ProductCard: FC<ProductCardProps> = ({
  product,
  ctaButtonLabel = 'Lägg i varukorg',
  locale,
  stripeProduct,
  stripeLoading = false,
  stripeError: _stripeError,
}) => {
  const {
    page_title,
    page_description,
    featured_image,
    previous_price,
    sizes,
  } = product.data;

  const { addItem, openCart } = useCart();
  const [showSizeModal, setShowSizeModal] = useState(false);

  // Get current locale from props or default to 'en-us'
  const currentLocale = locale || 'en-us';

  // Check if product has sizes
  const hasSizes =
    sizes &&
    Array.isArray(sizes) &&
    sizes.length > 0 &&
    sizes.some((size) => !size.disabled);

  const handleAddToCart = () => {
    if (!stripeProduct) {
      console.error('No product data available');
      return;
    }

    // If product has sizes, show size selection modal
    if (hasSizes) {
      setShowSizeModal(true);
      return;
    }

    // Otherwise, add directly to cart
    addItem({
      id: stripeProduct.product.id,
      name: stripeProduct.product.name,
      price: stripeProduct.price.amount || 0, // Use actual currency units, no cents
      currency: stripeProduct.price.currency,
      priceId: stripeProduct.price.id,
      quantity: 1,
      image: featured_image,
      metadata: {
        source: 'products_grid',
      },
    });

    // Automatically open the cart after adding item
    openCart();
  };

  return (
    <div className="group border-border bg-card relative flex flex-col overflow-hidden rounded-(--card-radius) border shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Product Image - Linked */}
      <PrismicNextLink document={product} className="block">
        <div className="aspect-[4/3] overflow-hidden">
          <Button
            variant="secondary"
            size="icon"
            asChild
            className="absolute top-4 right-4 z-10 scale-0 rounded-full opacity-0 transition-[transform_500ms,opacity_300ms] group-hover:scale-100 group-hover:opacity-100"
          >
            <div>
              <ArrowRight />
            </div>
          </Button>
          {isFilled.image(featured_image) ? (
            <PrismicNextImage
              field={featured_image}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="bg-muted flex h-full w-full items-center justify-center">
              <Image
                className="text-muted-foreground/50 size-12"
                aria-label="No image available"
              />
            </div>
          )}
        </div>
      </PrismicNextLink>

      {/* Product Content */}
      <div className="flex flex-1 flex-col p-6">
        {/* Product Content - Linked */}
        <PrismicNextLink document={product} className="flex-1">
          <div className="flex flex-1 flex-col">
            {/* Product Title and Price Row */}
            <div className="mb-3 flex items-center justify-between gap-2">
              {/* Product Title */}
              <h3 className="text-foreground flex-1 truncate text-xl leading-tight font-semibold transition-colors">
                {page_title || 'Product Title'}
              </h3>

              {/* Price Display */}
              <div className="flex flex-shrink-0 items-center gap-2">
                {isFilled.number(previous_price) && (
                  <span className="text-destructive text-sm line-through">
                    {formatPrice(
                      previous_price,
                      stripeProduct?.price.currency || 'USD',
                      currentLocale
                    )}
                  </span>
                )}
                {stripeLoading ? (
                  <Skeleton className="h-7 w-12" />
                ) : stripeProduct ? (
                  <span className="text-foreground text-lg font-semibold">
                    {formatPrice(
                      stripeProduct.price.amount || 0,
                      stripeProduct.price.currency,
                      currentLocale
                    )}
                  </span>
                ) : (
                  <span className="text-foreground text-lg font-semibold">
                    Price unavailable
                  </span>
                )}
              </div>
            </div>

            {/* Product Description */}
            {page_description && (
              <p className="text-muted-foreground -mt-1 line-clamp-2">
                {page_description}
              </p>
            )}
          </div>
        </PrismicNextLink>

        {/* Action Button - Not linked */}
        <Button
          size="default"
          variant="default"
          className="mt-4 w-full"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAddToCart();
          }}
          disabled={stripeLoading || !stripeProduct}
        >
          {stripeLoading ? (
            <LoadingSpinner className="size-4" />
          ) : (
            <>
              <Plus className="size-4" />
              {ctaButtonLabel}
            </>
          )}
        </Button>
      </div>

      {/* Size Selection Modal */}
      <SizeSelectionModal
        open={showSizeModal}
        onOpenChange={setShowSizeModal}
        product={product}
        stripeProduct={stripeProduct || null}
        sizes={sizes || []}
        featuredImage={featured_image}
        ctaButtonLabel={ctaButtonLabel}
        isLoading={stripeLoading}
        locale={currentLocale}
      />
    </div>
  );
};

// Skeleton component for loading state
export const ProductCardSkeleton: FC = () => {
  return (
    <div className="border-border bg-card flex flex-col overflow-hidden rounded-(--card-radius) border shadow-sm">
      {/* Image skeleton */}
      <div className="bg-muted aspect-[4/3]" />

      {/* Content skeleton */}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex flex-1 flex-col">
          <div className="bg-muted mb-2 h-6 w-3/4 rounded" />
          <div className="mt-2 space-y-1">
            <div className="bg-muted h-4 w-full rounded" />
            <div className="bg-muted h-4 w-2/3 rounded" />
          </div>
        </div>

        {/* Button skeletons */}
        <div className="mt-4 flex gap-2">
          <div className="bg-muted h-9 flex-1 rounded" />
        </div>
      </div>
    </div>
  );
};
