'use client';

import { FC, useEffect, useRef, useState } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { PrismicNextImage } from '@prismicio/next';
import { SliceComponentProps } from '@prismicio/react';
import { ArrowRight, Play, Plus } from 'lucide-react';

import { CustomRichText } from '@/components/custom-rich-text';
import { ExtendedSliceProps } from '@/components/custom-slice-zone';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { ProgressiveBlur } from '@/components/motion-primitives/progressive-blur';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { QuantityPicker } from '@/components/ui/quantity-picker';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tagline } from '@/components/ui/tagline';
import { useCart } from '@/contexts/cart-context';
import { useStripeProduct } from '@/hooks/use-stripe-product';
import { cn, formatPrice } from '@/lib/utils';

import type { CarouselApi } from '@/components/ui/carousel';

/**
 * Props for `ProductHero`.
 */
export type ProductHeroProps = SliceComponentProps<Content.ProductHeroSlice> &
  Pick<ExtendedSliceProps, 'index' | 'context'>;

/**
 * Component for "ProductHero" Slices.
 */
const ProductHero: FC<ProductHeroProps> = ({ slice, index, context }) => {
  const {
    media,
    callout,
    title,
    description,
    cart_button_label,
    buy_button_label,
    tinted_background,
    product,
  } = slice.primary;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  });
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);
  const isFirstSlice = index === 0;
  const { addItem, openCart } = useCart();

  // Get current locale from context
  const currentLocale =
    typeof context?.locale === 'string' ? context.locale : 'en-us';

  // Get video MIME type based on file extension
  const getVideoMimeType = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'mp4':
        return 'video/mp4';
      case 'webm':
        return 'video/webm';
      case 'ogg':
        return 'video/ogg';
      case 'mov':
        return 'video/quicktime';
      default:
        return 'video/mp4'; // Default fallback
    }
  };

  // Get data from linked product (priority) or context (fallback)
  const linkedProductData =
    isFilled.contentRelationship(product) && product.data ? product.data : null;

  // Get sizes: linked product > context > empty array
  const sizes =
    linkedProductData?.sizes ||
    (Array.isArray(context?.sizes)
      ? (context.sizes as Array<{ size?: string; disabled?: boolean }>)
      : []);

  // Get previous_price: linked product > context > null
  const previous_price =
    linkedProductData?.previous_price ||
    (typeof context?.previous_price === 'number'
      ? context.previous_price
      : null);

  // Use stripe_product_id from: linked product > context
  const productId =
    linkedProductData?.stripe_product_id ||
    (typeof context?.stripe_product_id === 'string'
      ? context.stripe_product_id
      : null);

  // Fetch product data from Stripe
  const {
    data: stripeProduct,
    loading: stripeLoading,
    error: stripeError,
  } = useStripeProduct(productId, currentLocale);

  // Initialize selected size when sizes are available
  useEffect(() => {
    if (sizes.length > 0 && !selectedSize) {
      // Find the first available (non-disabled) size
      const firstAvailableSize = sizes.find((size) => !size.disabled);
      if (firstAvailableSize) {
        setSelectedSize(firstAvailableSize.size || '');
      }
    }
  }, [sizes, selectedSize]);

  // Handle carousel slide changes
  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setCurrentImageIndex(carouselApi.selectedScrollSnap());
    };

    carouselApi.on('select', onSelect);
    return () => {
      carouselApi.off('select', onSelect);
    };
  }, [carouselApi]);

  // Navigate to specific slide (for thumbnail clicks)
  const goToSlide = (index: number) => {
    if (carouselApi) {
      carouselApi.scrollTo(index);
    }
  };

  const handleAddToCart = () => {
    if (!stripeProduct) {
      console.error('No product data available');
      return;
    }

    // Get the first media item's image for cart display
    const firstImage =
      isFilled.group(media) &&
      media.length > 0 &&
      isFilled.image(media[0].image)
        ? media[0].image
        : undefined;

    addItem({
      id: stripeProduct.product.id,
      name: stripeProduct.product.name,
      price: stripeProduct.price.amount || 0,
      currency: stripeProduct.price.currency,
      priceId: stripeProduct.price.id,
      quantity: quantity,
      size: selectedSize || undefined,
      image: firstImage,
      metadata: {
        source: 'product_hero',
      },
    });

    // Automatically open the cart after adding item
    openCart();
  };

  const handleBuyClick = async () => {
    if (!stripeProduct) {
      console.error('No product data available');
      return;
    }

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: stripeProduct.product.id,
          priceId: stripeProduct.price.id,
          quantity: quantity,
          metadata: {
            size: selectedSize || '',
            source: 'product_hero',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      // You might want to show a toast notification here
    }
  };

  const handleThumbnailScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const { scrollLeft, scrollWidth, clientWidth } = element;

    setScrollState({
      canScrollLeft: scrollLeft > 0,
      canScrollRight: scrollLeft < scrollWidth - clientWidth - 1, // -1 for rounding
    });
  };

  // Initialize scroll state on mount
  useEffect(() => {
    const element = thumbnailScrollRef.current;
    if (element && media.length >= 5) {
      const { scrollLeft, scrollWidth, clientWidth } = element;
      setScrollState({
        canScrollLeft: scrollLeft > 0,
        canScrollRight: scrollLeft < scrollWidth - clientWidth - 1,
      });
    }
  }, [media.length]);

  // Auto-scroll to current thumbnail when image changes
  useEffect(() => {
    const element = thumbnailScrollRef.current;
    if (element && media.length > 1) {
      const thumbnailWidth =
        media.length < 5
          ? element.clientWidth / 4 // 4 items visible
          : element.clientWidth / 4.5; // 4.5 items visible

      const gap = 4; // gap-1 = 4px
      const itemWidth = thumbnailWidth + gap;
      const targetScrollLeft = currentImageIndex * itemWidth;

      // Calculate if current item is fully visible
      const { scrollLeft, clientWidth } = element;
      const itemStart = currentImageIndex * itemWidth;
      const itemEnd = itemStart + thumbnailWidth;

      // Scroll if item is not fully visible
      if (itemStart < scrollLeft || itemEnd > scrollLeft + clientWidth) {
        element.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth',
        });
      }
    }
  }, [currentImageIndex, media.length]);

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      tintedBackground={tinted_background}
      className="first-of-type:pt-0"
    >
      <Container>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-20">
          {/* Media Gallery */}
          <div className="relative">
            {isFilled.group(media) &&
              media.length > 0 &&
              media.some(
                (item) =>
                  isFilled.image(item.image) || isFilled.linkToMedia(item.video)
              ) && (
                <>
                  {/* Carousel for Main Media */}
                  <Carousel
                    opts={{
                      align: 'start',
                      loop: true,
                    }}
                    setApi={setCarouselApi}
                    className="w-full overflow-hidden rounded-(--card-radius)"
                  >
                    <CarouselContent className="-ml-0">
                      {media.map((mediaItem, index) => (
                        <CarouselItem key={index} className="pl-0">
                          <div className="bg-accent relative aspect-square overflow-hidden">
                            {/* Video (priority over image) */}
                            {isFilled.linkToMedia(mediaItem?.video) &&
                              'url' in mediaItem.video &&
                              mediaItem.video.url && (
                                <video
                                  className="h-full w-full object-cover"
                                  preload="metadata"
                                  controls={false}
                                  playsInline
                                  autoPlay
                                  loop
                                  muted
                                  poster={
                                    isFilled.image(mediaItem?.image) &&
                                    mediaItem.image.url
                                      ? mediaItem.image.url
                                      : undefined
                                  }
                                >
                                  <source
                                    src={
                                      isFilled.image(mediaItem?.image) &&
                                      mediaItem.image.url
                                        ? mediaItem.video.url
                                        : `${mediaItem.video.url}#t=0.001`
                                    }
                                    type={getVideoMimeType(mediaItem.video.url)}
                                  />
                                  Your browser does not support the video tag.
                                </video>
                              )}

                            {/* Image (fallback or when no video) */}
                            {!isFilled.linkToMedia(mediaItem?.video) &&
                              isFilled.image(mediaItem?.image) && (
                                <PrismicNextImage
                                  field={mediaItem.image}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 1024px) 100vw, 50vw"
                                  priority={isFirstSlice && index === 0}
                                />
                              )}
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>

                    {/* Navigation arrows for multiple images */}
                    {media.length > 1 && (
                      <>
                        <CarouselPrevious
                          variant="secondary"
                          className="left-2 lg:left-4"
                        />
                        <CarouselNext
                          variant="secondary"
                          className="right-2 lg:right-4"
                        />
                      </>
                    )}
                  </Carousel>

                  {/* Thumbnail Gallery */}
                  {media.length > 1 && (
                    <div className="relative mt-2">
                      <div
                        ref={thumbnailScrollRef}
                        className="scrollbar-hide flex gap-2 overflow-x-auto pb-1"
                        onScroll={handleThumbnailScroll}
                      >
                        {media.map((mediaItem, index) => (
                          <button
                            key={index}
                            className={cn(
                              'bg-muted relative aspect-square flex-shrink-0 overflow-hidden rounded-(--card-radius) border-3 transition-colors',
                              // Use grid of 4 for ≤4 items, 4.5 layout for ≥5 items
                              media.length < 5
                                ? 'w-[calc(25%-8px)]'
                                : 'w-[calc(22.22%-8px)]', // ~4.5 items visible
                              index === currentImageIndex
                                ? 'border-primary'
                                : 'border-border'
                            )}
                            onClick={() => goToSlide(index)}
                          >
                            {/* Show video thumbnail or image thumbnail */}
                            {isFilled.linkToMedia(mediaItem.video) &&
                            'url' in mediaItem.video &&
                            mediaItem.video.url ? (
                              <>
                                <video
                                  className="h-full w-full object-cover"
                                  preload="metadata"
                                  muted
                                  playsInline
                                  controls={false}
                                  poster={
                                    isFilled.image(mediaItem.image) &&
                                    mediaItem.image.url
                                      ? mediaItem.image.url
                                      : undefined
                                  }
                                >
                                  <source
                                    src={
                                      isFilled.image(mediaItem.image) &&
                                      mediaItem.image.url
                                        ? mediaItem.video.url
                                        : `${mediaItem.video.url}#t=0.001`
                                    }
                                    type={getVideoMimeType(mediaItem.video.url)}
                                  />
                                  Your browser does not support the video tag.
                                </video>
                                {/* Play icon overlay for videos */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                  <Play
                                    className="size-6 text-white lg:size-8"
                                    fill="white"
                                  />
                                </div>
                              </>
                            ) : isFilled.image(mediaItem.image) ? (
                              <PrismicNextImage
                                field={mediaItem.image}
                                fill
                                className="object-cover"
                                sizes="15vw"
                              />
                            ) : null}
                          </button>
                        ))}
                      </div>

                      {/* Fade and Progressive Blur based on scroll position */}
                      {media.length >= 5 && (
                        <>
                          {/* Left fade - show when scrolled right */}
                          <div
                            className={cn(
                              'absolute inset-y-0 left-0 h-full w-6 transition-opacity duration-300',
                              scrollState.canScrollLeft
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          >
                            <ProgressiveBlur
                              direction="left"
                              blurLayers={4}
                              blurIntensity={1}
                              className="h-full w-full"
                            />
                            <div className="from-background absolute inset-0 bg-gradient-to-r to-transparent" />
                          </div>

                          {/* Right fade - show when can scroll right */}
                          <div
                            className={cn(
                              'absolute inset-y-0 right-0 h-full w-6 transition-opacity duration-300',
                              scrollState.canScrollRight
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          >
                            <ProgressiveBlur
                              direction="right"
                              blurLayers={4}
                              blurIntensity={1}
                              className="h-full w-full"
                            />
                            <div className="from-background absolute inset-0 bg-gradient-to-l to-transparent" />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
          </div>

          {/* Product Information */}
          <div className="flex flex-col gap-8 lg:max-w-xl lg:gap-10">
            <div className="flex flex-col gap-4 lg:gap-6">
              <div className="flex flex-col gap-3 lg:gap-4">
                {/* Callout */}
                {isFilled.richText(callout) && (
                  <div>
                    <Tagline size="sm" gradient>
                      <CustomRichText className="text-sm" field={callout} />
                    </Tagline>
                  </div>
                )}

                {/* Title */}
                {isFilled.richText(title) && (
                  <CustomRichText
                    className="prose-headings:!mb-0 prose-headings:!text-3xl lg:prose-headings:!text-5xl text-3xl font-bold"
                    field={title}
                  />
                )}

                {/* Description */}
                {isFilled.richText(description) && (
                  <CustomRichText
                    className="lg:prose-lg prose"
                    field={description}
                  />
                )}
              </div>

              {/* Pricing */}
              <div className="flex flex-wrap items-baseline gap-2 lg:gap-3">
                {stripeLoading || (!stripeProduct && !stripeError) ? (
                  <Skeleton className="h-8 w-32 lg:h-10 lg:w-48" />
                ) : stripeProduct ? (
                  <>
                    <span className="text-2xl font-bold lg:text-4xl">
                      {stripeProduct.price.formatted}
                    </span>
                    {previous_price && (
                      <span className="text-destructive text-sm line-through lg:text-base">
                        {typeof previous_price === 'number'
                          ? formatPrice(
                              previous_price,
                              stripeProduct?.price.currency || 'USD',
                              currentLocale
                            )
                          : previous_price}
                      </span>
                    )}
                  </>
                ) : previous_price ? (
                  <span className="text-destructive text-sm line-through lg:text-base">
                    {typeof previous_price === 'number'
                      ? formatPrice(
                          previous_price,
                          'USD', // Default currency when no Stripe product
                          currentLocale
                        )
                      : previous_price}
                  </span>
                ) : null}

                {stripeError && (
                  <span className="text-destructive text-sm">
                    Failed to load price
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Size Selection and Quantity */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Size Selection */}
                {sizes.length > 0 && (
                  <div className="flex-1">
                    <Tabs value={selectedSize} onValueChange={setSelectedSize}>
                      <TabsList className="h-10">
                        {sizes.map((sizeItem, index) => (
                          <TabsTrigger
                            className="px-3"
                            key={index}
                            value={sizeItem.size || ''}
                            disabled={sizeItem.disabled}
                          >
                            {sizeItem.size}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>
                )}

                {/* Quantity Selection */}
                <QuantityPicker
                  value={quantity}
                  onChange={setQuantity}
                  min={1}
                  max={99}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex w-full flex-col gap-2">
                {/* Add to Cart Button - Only render if cart_button_label is filled */}
                {isFilled.keyText(cart_button_label) && (
                  <Button
                    size="lg"
                    variant="default"
                    className="w-full"
                    onClick={handleAddToCart}
                    disabled={
                      stripeLoading ||
                      !stripeProduct ||
                      (sizes.length > 0 && !selectedSize)
                    }
                  >
                    {stripeLoading ? (
                      <LoadingSpinner className="text-foreground" />
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        {isFilled.keyText(cart_button_label)
                          ? cart_button_label
                          : 'Add to Cart'}
                      </>
                    )}
                  </Button>
                )}

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={handleBuyClick}
                  disabled={
                    stripeLoading ||
                    !stripeProduct ||
                    (sizes.length > 0 && !selectedSize)
                  }
                >
                  {stripeLoading ? (
                    <LoadingSpinner className="text-foreground" />
                  ) : (
                    <>
                      {isFilled.keyText(buy_button_label)
                        ? buy_button_label
                        : 'Buy Now'}
                      <ArrowRight />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default ProductHero;
