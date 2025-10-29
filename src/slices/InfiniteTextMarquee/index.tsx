'use client';

import { FC } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { SliceComponentProps } from '@prismicio/react';

import { CustomRichText } from '@/components/custom-rich-text';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { InfiniteSlider } from '@/components/motion-primitives/infinite-slider';
import { ProgressiveBlur } from '@/components/motion-primitives/progressive-blur';
import { cn } from '@/lib/utils';

/**
 * Props for `InfiniteTextMarquee`.
 */
export type InfiniteTextMarqueeProps =
  SliceComponentProps<Content.InfiniteTextMarqueeSlice>;

/**
 * Component for "InfiniteTextMarquee" Slices.
 */
const InfiniteTextMarquee: FC<InfiniteTextMarqueeProps> = ({ slice }) => {
  const { text, direction, speed, pause_on_hover, tinted_background } =
    slice.primary;

  // Default values with proper type checking
  const scrollSpeed = typeof speed === 'number' && speed > 0 ? speed : 75;
  const pauseOnHover = pause_on_hover === true;
  const scrollDirection =
    direction && ['left', 'right', 'up', 'down'].includes(direction)
      ? direction
      : 'left';

  // InfiniteSlider uses positive speeds and reverse prop for direction
  const sliderSpeed = Math.abs(scrollSpeed);
  // For hover: use a much slower speed for pause effect, or same speed to continue
  const hoverSpeed = pauseOnHover
    ? Math.max(1, sliderSpeed * 0.1)
    : sliderSpeed;

  if (!isFilled.richText(text)) {
    return null;
  }

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="overflow-hidden py-4 lg:py-12"
      tintedBackground={tinted_background}
    >
      <Container>
        <div className="relative w-full">
          <InfiniteSlider
            speed={sliderSpeed !== 0 ? sliderSpeed : 75}
            speedOnHover={hoverSpeed}
            gap={0}
            reverse={scrollDirection === 'right'}
          >
            {/* Repeat the text multiple times for seamless loop */}
            {Array.from({ length: 10 }, (_, index) => (
              <div
                key={index}
                className="text-primary flex items-center py-4 whitespace-nowrap"
              >
                <CustomRichText
                  field={text}
                  className="text-primary text-5xl font-(--bold-text) tracking-tight select-none lg:text-9xl"
                />
                {/* Add separator between repeated text */}
                <span className="mx-2 text-5xl select-none lg:mx-6 lg:text-9xl">
                  •
                </span>
              </div>
            ))}
          </InfiniteSlider>

          {/* Edge fades - only for horizontal scrolling */}
          {(scrollDirection === 'left' || scrollDirection === 'right') && (
            <>
              <ProgressiveBlur
                direction="left"
                blurLayers={6}
                blurIntensity={1}
                className="absolute inset-y-0 left-0 h-full w-10 md:w-24"
              />
              <ProgressiveBlur
                direction="right"
                blurLayers={6}
                blurIntensity={1}
                className="absolute inset-y-0 right-0 h-full w-10 md:w-24"
              />

              <div
                className={cn(
                  'absolute inset-y-0 left-0 w-10 bg-linear-to-r md:w-24',
                  tinted_background ? 'from-(--tinted-bg)' : 'from-background'
                )}
              />
              <div
                className={cn(
                  'absolute inset-y-0 right-0 w-10 bg-linear-to-l md:w-24',
                  tinted_background ? 'from-(--tinted-bg)' : 'from-background'
                )}
              />
            </>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default InfiniteTextMarquee;
