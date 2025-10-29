'use client';

import { FC } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { SliceComponentProps } from '@prismicio/react';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { InfiniteSlider } from '@/components/motion-primitives/infinite-slider';
import { ProgressiveBlur } from '@/components/motion-primitives/progressive-blur';
import { SectionIntro } from '@/components/section-intro';
import { CustomSVG } from '@/components/svg';
import { cn, hasSectionIntroContent } from '@/lib/utils';

/**
 * Props for `LogoShowcase`.
 */
export type LogoShowcaseProps = SliceComponentProps<Content.LogoShowcaseSlice>;

/**
 * Component for "LogoShowcase" Slices.
 */
const LogoShowcase: FC<LogoShowcaseProps> = ({ slice }) => {
  const { callout, title, description, buttons, logos, tinted_background } =
    slice.primary;
  const logosData = isFilled.group(logos) ? logos : [];
  const hasIntroContent = hasSectionIntroContent(slice);

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={cn(!hasIntroContent ? 'py-6 lg:py-8' : 'py-10 lg:py-20')}
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
              buttons={isFilled.link(buttons) ? [buttons] : undefined}
              align="center"
              className="mb-6 lg:mb-8"
            />
          )}

          {/* Logo Slider Section */}
          {logosData.length > 0 && (
            <div className="relative w-full max-w-6xl">
              <InfiniteSlider
                speedOnHover={20}
                speed={75}
                gap={48}
                className="py-4"
              >
                {logosData.map((logoItem, index) => (
                  <div
                    key={index}
                    className="flex h-12 w-auto items-center justify-center transition-all duration-300"
                  >
                    {isFilled.image(logoItem.logo) && (
                      <CustomSVG
                        src={logoItem.logo.url}
                        className="h-full max-h-[28px] w-auto max-w-[144px] object-contain"
                        title={logoItem.logo.alt}
                      />
                    )}
                  </div>
                ))}
              </InfiniteSlider>

              <ProgressiveBlur
                direction="left"
                blurLayers={6}
                blurIntensity={1}
                className="absolute inset-y-0 left-0 h-full w-16"
              />
              <ProgressiveBlur
                direction="right"
                blurLayers={6}
                blurIntensity={1}
                className="absolute inset-y-0 right-0 h-full w-16"
              />
              <div
                className={cn(
                  'absolute inset-y-0 left-0 w-20 bg-linear-to-r',
                  tinted_background ? 'from-(--tinted-bg)' : 'from-background'
                )}
              />
              <div
                className={cn(
                  'absolute inset-y-0 right-0 w-20 bg-linear-to-l',
                  tinted_background ? 'from-(--tinted-bg)' : 'from-background'
                )}
              />
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default LogoShowcase;
