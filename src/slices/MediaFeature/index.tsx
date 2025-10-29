import { FC } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { PrismicNextImage } from '@prismicio/next';
import { SliceComponentProps } from '@prismicio/react';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { SectionIntro } from '@/components/section-intro';
import { cn } from '@/lib/utils';

/**
 * Props for `MediaFeature`.
 */
export type MediaFeatureProps = SliceComponentProps<Content.MediaFeatureSlice>;

/**
 * Component for "MediaFeature" Slices.
 */
const MediaFeature: FC<MediaFeatureProps> = ({ slice, index }) => {
  const { callout, title, description, buttons, media, tinted_background } =
    slice.primary;
  const isFirstSlice = index === 0;
  const isImageLeft = slice.primary.media_position === 'Left';

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="first-of-type:pt-0"
      tintedBackground={tinted_background}
      mobilePaddingless={slice.primary.tinted_background}
    >
      <Container className="!px-0 sm:!px-(--container-padding-mobile) md:!px-(--container-padding-desktop)">
        <div className="bg-primary relative flex w-full flex-col items-stretch overflow-hidden sm:rounded-(--card-radius) lg:flex-row">
          {/* Content Section - Left Side */}
          <div
            className={cn(
              'relative flex w-full flex-col items-start justify-center',
              isImageLeft ? 'lg:order-1' : 'lg:order-0'
            )}
          >
            <SectionIntro
              callout={callout}
              title={title}
              description={description}
              buttons={buttons}
              align="left"
              className="prose-headings:text-primary-foreground prose-p:text-primary-foreground px-5 py-8 lg:p-12"
              calloutClassName="border-background/20"
            />
          </div>

          {/* Media Section - Right Side */}
          {isFilled.image(media) && (
            <div
              className={cn(
                'relative aspect-[16/14] h-auto w-full overflow-hidden pt-4 lg:pt-16',
                isImageLeft ? 'pr-6 lg:order-0' : 'pl-6 lg:order-1'
              )}
            >
              <PrismicNextImage
                field={media}
                className={cn(
                  'h-full w-full object-cover',
                  isImageLeft
                    ? 'rounded-tr-[calc(var(--card-radius)-0.5rem)]'
                    : 'rounded-tl-[calc(var(--card-radius)-0.5rem)]'
                )}
                sizes="(max-width: 768px) 80vw, 50vw"
                priority={isFirstSlice}
              />
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default MediaFeature;
