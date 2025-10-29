'use client';

import { FC, useEffect, useState } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { PrismicNextImage } from '@prismicio/next';
import { SliceComponentProps } from '@prismicio/react';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { SectionIntro } from '@/components/section-intro';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { cn, hasSectionIntroContent } from '@/lib/utils';

import type { CarouselApi } from '@/components/ui/carousel';

/**
 * Props for `CarouselGallery`.
 */
export type CarouselGalleryProps =
  SliceComponentProps<Content.CarouselGallerySlice>;

/**
 * Component for "CarouselGallery" Slices.
 */
const CarouselGallery: FC<CarouselGalleryProps> = ({ slice }) => {
  const { callout, title, description, slides } = slice.primary;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [api, setApi] = useState<CarouselApi | null>(null);
  const hasIntroContent = hasSectionIntroContent(slice);

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

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <Container>
        <div className="flex flex-col gap-8 pb-6 lg:gap-12">
          {/* Header Content */}
          {hasIntroContent && (
            <SectionIntro
              callout={callout}
              title={title}
              description={description}
              align="center"
              className="max-w-2xl"
            />
          )}

          {/* Carousel Gallery - Full Width */}
          {isFilled.group(slides) && slides.length > 0 && (
            <div className="relative">
              <Carousel
                opts={{
                  align: 'start',
                  loop: true,
                }}
                className="w-full"
                setApi={setApi}
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {slides.map((slide, index) => (
                    <CarouselItem
                      key={index}
                      className="basis-full pl-2 md:pl-4"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden rounded-(--card-radius)">
                        {isFilled.image(slide.image) && (
                          <PrismicNextImage
                            field={slide.image}
                            className="h-full w-full object-cover"
                            sizes="(max-width: 768px) 100vw, 100vw"
                          />
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious variant="secondary" />
                <CarouselNext variant="secondary" />

                {/* Carousel Indicators */}
                <div className="absolute right-0 -bottom-8 left-0 mt-4 flex justify-center gap-1">
                  {slides.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        'h-2 w-2 rounded-full transition-all',
                        currentSlide === index
                          ? 'bg-primary w-5'
                          : 'bg-primary/20'
                      )}
                    />
                  ))}
                </div>
              </Carousel>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default CarouselGallery;
