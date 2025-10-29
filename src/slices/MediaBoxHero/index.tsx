import { FC } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { PrismicNextImage } from '@prismicio/next';
import { SliceComponentProps } from '@prismicio/react';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { BorderTrail } from '@/components/motion-primitives/border-trail';
import { SectionIntro } from '@/components/section-intro';
import { cn } from '@/lib/utils';

/**
 * Props for `MediaBoxHero`.
 */
export type MediaBoxHeroProps =
  SliceComponentProps<Content.HeadlineMediaCallToActionSlice>;

/**
 * Component for "MediaBoxHero" Slices.
 */
const MediaBoxHero: FC<MediaBoxHeroProps> = ({ slice, index }) => {
  const isImageLeft = slice.primary.media_position === 'Left';
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
        <div className="bg-accent relative flex overflow-hidden sm:rounded-(--card-radius) lg:min-h-[640px]">
          <div
            className={cn(
              'grid w-full lg:grid-cols-2',
              isImageLeft && 'lg:grid-flow-col-dense'
            )}
          >
            {/* Content */}
            <div
              className={cn(
                'relative z-10 flex max-w-2xl flex-col items-start justify-center px-5 py-8 lg:p-12',
                isImageLeft && 'lg:col-start-2'
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

            {/* Media with fade effect */}
            {isFilled.image(slice.primary.media) && (
              <div className={cn('relative', isImageLeft && 'lg:col-start-1')}>
                <div
                  className={cn(
                    'absolute inset-0',
                    isImageLeft
                      ? 'from-accent via-accent/50 lg:from-accent lg:via-accent/50 bg-gradient-to-b to-transparent lg:bg-gradient-to-l lg:to-transparent'
                      : 'from-accent via-accent/50 lg:from-accent lg:via-accent/50 bg-gradient-to-b to-transparent lg:bg-gradient-to-r lg:to-transparent'
                  )}
                />
                <PrismicNextImage
                  sizes="(max-width: 1200px) 90vw, 40vw"
                  field={slice.primary.media}
                  className="!m-0 h-full w-full object-cover"
                  priority={isFirstSlice}
                />
              </div>
            )}
          </div>

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
        </div>
      </Container>
    </Section>
  );
};

export default MediaBoxHero;
