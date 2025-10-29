'use client';

import { FC } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { PrismicNextImage } from '@prismicio/next';
import { SliceComponentProps } from '@prismicio/react';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { ProgressiveBlur } from '@/components/motion-primitives/progressive-blur';
import { SectionIntro } from '@/components/section-intro';
import { hasSectionIntroContent } from '@/lib/utils';

/**
 * Props for `HeroWithMedia`.
 */
export type HeroWithMediaProps =
  SliceComponentProps<Content.HeroWithMediaSlice>;

/**
 * Component for "HeroWithMedia" Slices.
 */
const HeroWithMedia: FC<HeroWithMediaProps> = ({ slice, index }) => {
  const { callout, title, description, buttons, media, tinted_background } =
    slice.primary;
  const hasIntroContent = hasSectionIntroContent(slice);
  const isFirstSlice = index === 0;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="relative"
      tintedBackground={tinted_background}
    >
      <Container>
        <div className="flex flex-col items-center text-center">
          {/* Content Section */}
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

          {/* Media Section */}
          {isFilled.image(media) && (
            <div className="relative w-full">
              <div className="bg-primary pointer-events-none absolute z-0 aspect-[16/10] w-full -translate-y-[15%] rounded-full opacity-20 blur-2xl lg:blur-3xl" />

              {/* Image Container with Aspect Ratios */}
              <div className="relative w-full overflow-hidden rounded-t-(--card-radius)">
                <div className="relative aspect-[4/3] w-full lg:aspect-[16/10]">
                  <PrismicNextImage
                    field={media}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 1200px"
                    priority={isFirstSlice}
                  />
                </div>

                {/* Fade to bottom overlay */}
                <div className="from-background absolute right-0 bottom-0 left-0 h-2/3 bg-gradient-to-t to-transparent" />
              </div>
            </div>
          )}

          <ProgressiveBlur
            direction="bottom"
            blurLayers={8}
            blurIntensity={2}
            className="absolute bottom-0 aspect-[3/1] w-full lg:aspect-[4/1]"
          />
        </div>
      </Container>
    </Section>
  );
};

export default HeroWithMedia;
