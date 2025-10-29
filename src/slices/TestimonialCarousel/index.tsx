'use client';

import { FC, useEffect, useState } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { PrismicNextImage } from '@prismicio/next';
import { SliceComponentProps } from '@prismicio/react';

import { CustomRichText } from '@/components/custom-rich-text';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { ProgressiveBlur } from '@/components/motion-primitives/progressive-blur';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { StarRating } from '@/components/ui/star-rating';
import { cn } from '@/lib/utils';

import type { CarouselApi } from '@/components/ui/carousel';

/**
 * Props for `TestimonialCarousel`.
 */
export type TestimonialCarouselProps =
  SliceComponentProps<Content.TestimonialCarouselSlice>;

/**
 * Component for "TestimonialCarousel" Slices.
 */
const TestimonialCarousel: FC<TestimonialCarouselProps> = ({ slice }) => {
  const { testimonials, tinted_background } = slice.primary;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [api, setApi] = useState<CarouselApi | null>(null);

  const testimonialsData = isFilled.group(testimonials) ? testimonials : [];

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentSlide(api.selectedScrollSnap());
    };

    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  if (testimonialsData.length === 0) {
    return null;
  }

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="py-6 lg:py-12"
      tintedBackground={tinted_background}
    >
      <Container>
        <div className="relative mx-auto max-w-5xl pb-8">
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full"
            setApi={setApi}
          >
            <CarouselContent>
              {testimonialsData.map((testimonial, index) => (
                <CarouselItem key={index} className="basis-full">
                  <div className="flex h-full flex-col items-center justify-center space-y-6 py-8 text-center">
                    {/* Rating Stars */}
                    {typeof testimonial.rating === 'number' &&
                      testimonial.rating > 0 && (
                        <StarRating
                          rating={Math.min(Math.max(testimonial.rating, 0), 5)}
                        />
                      )}

                    {/* Quote */}
                    {isFilled.richText(testimonial.quote) && (
                      <CustomRichText
                        field={testimonial.quote}
                        className="text-foreground px-8 text-base leading-relaxed md:px-24 md:text-2xl"
                      />
                    )}

                    {/* Author Info */}
                    <div className="flex items-center gap-4 px-8">
                      {/* Avatar */}
                      {isFilled.image(testimonial.user_avatar) && (
                        <div className="bg-muted relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                          <PrismicNextImage
                            field={testimonial.user_avatar}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      )}

                      {/* Name and Job Title */}
                      <div className="text-left">
                        {testimonial.user_name && (
                          <div className="text-foreground font-(--bold-text)">
                            {testimonial.user_name}
                          </div>
                        )}
                        {testimonial.user_job_title && (
                          <div className="text-muted-foreground text-sm">
                            {testimonial.user_job_title}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <ProgressiveBlur
              direction="left"
              blurLayers={6}
              blurIntensity={1}
              className="absolute inset-y-0 left-0 h-full w-10"
            />
            <ProgressiveBlur
              direction="right"
              blurLayers={6}
              blurIntensity={1}
              className="absolute inset-y-0 right-0 h-full w-10"
            />
            <div
              className={cn(
                'absolute inset-y-0 left-0 w-10 bg-linear-to-r',
                tinted_background ? 'from-(--tinted-bg)' : 'from-background'
              )}
            />
            <div
              className={cn(
                'absolute inset-y-0 right-0 w-10 bg-linear-to-l',
                tinted_background ? 'from-(--tinted-bg)' : 'from-background'
              )}
            />

            {/* Navigation Arrows */}
            <CarouselPrevious className="left-0 hidden md:flex" />
            <CarouselNext className="right-0 hidden md:flex" />

            {/* Carousel Indicators */}
            <div className="absolute right-0 -bottom-4 left-0 flex justify-center gap-1">
              {testimonialsData.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'h-2 w-2 rounded-full transition-all',
                    currentSlide === index ? 'bg-primary w-5' : 'bg-primary/20'
                  )}
                />
              ))}
            </div>
          </Carousel>
        </div>
      </Container>
    </Section>
  );
};

export default TestimonialCarousel;
