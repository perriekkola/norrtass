import { FC } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { PrismicNextImage } from '@prismicio/next';
import { SliceComponentProps } from '@prismicio/react';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { BorderTrail } from '@/components/motion-primitives/border-trail';
import { ProgressiveBlur } from '@/components/motion-primitives/progressive-blur';
import { SectionIntro } from '@/components/section-intro';
import { cn } from '@/lib/utils';

/**
 * Props for `ImageCardFeature`.
 */
export type ImageCardFeatureProps =
  SliceComponentProps<Content.ImageCardFeatureSlice>;

/**
 * Component for "ImageCardFeature" Slices.
 */
const ImageCardFeature: FC<ImageCardFeatureProps> = ({ slice, index }) => {
  const useDarkTexts = slice.primary.dark_texts;
  const addOverlay = slice.primary.add_overlay;
  const isFirstSlice = index === 0;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="first-of-type:pt-0"
      tintedBackground={slice.primary.tinted_background}
      mobilePaddingless={slice.primary.tinted_background}
    >
      <Container className="!px-0 sm:!px-(--container-padding-mobile) md:!px-(--container-padding-desktop)">
        <div className="bg-muted relative flex min-h-[480px] flex-col justify-center overflow-hidden sm:rounded-(--card-radius) lg:min-h-[640px] lg:justify-end">
          {/* Background Image */}
          {isFilled.image(slice.primary.image) && (
            <PrismicNextImage
              sizes="(max-width: 1200px) 90vw, 1500px"
              field={slice.primary.image}
              className="absolute inset-0 h-full w-full object-cover"
              priority={isFirstSlice}
            />
          )}

          {slice.primary.border_trail && (
            <BorderTrail
              className="hidden sm:block"
              style={{
                boxShadow:
                  '0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)',
              }}
              size={100}
            />
          )}

          {addOverlay && (
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/10" />
          )}

          {/* Progressive Blur at Bottom */}
          {slice.primary.add_blur && (
            <div className="absolute right-0 bottom-0 left-0 h-full lg:h-2/3">
              <ProgressiveBlur
                direction="bottom"
                blurLayers={6}
                blurIntensity={1}
                className="h-full"
              />
            </div>
          )}

          {/* Content at Bottom */}
          <div
            className={cn(
              'relative max-w-2xl p-5 lg:p-12',
              !useDarkTexts
                ? 'prose-headings:text-white prose-p:text-white [&_.text-link]:text-white'
                : 'prose-p:text-black prose-headings:!text-black [&_.text-link]:text-black'
            )}
          >
            <SectionIntro
              title={slice.primary.title}
              description={slice.primary.description}
              callout={slice.primary.callout}
              buttons={slice.primary.buttons}
              align="left"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default ImageCardFeature;
