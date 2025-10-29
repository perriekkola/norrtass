import { FC } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { PrismicNextImage } from '@prismicio/next';
import { SliceComponentProps } from '@prismicio/react';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { SectionIntro } from '@/components/section-intro';
import { cn } from '@/lib/utils';

/**
 * Props for `HeadlineImageCta`.
 */
export type HeadlineImageCtaProps =
  SliceComponentProps<Content.HeadlineImageCtaSlice>;

/**
 * Component for "HeadlineImageCta" Slices.
 */
const HeadlineImageCta: FC<HeadlineImageCtaProps> = ({ slice, index }) => {
  const {
    callout,
    headline,
    description,
    image,
    media_position,
    buttons,
    tinted_background,
  } = slice.primary;
  const isImageLeft = media_position === 'Left';
  const isFirstSlice = index === 0;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      tintedBackground={tinted_background}
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Content Section */}
          <div
            className={cn(
              'flex flex-col justify-center',
              isImageLeft ? 'lg:order-2' : 'lg:order-1'
            )}
          >
            <SectionIntro
              callout={callout}
              title={headline}
              description={description}
              buttons={buttons}
              align="left"
              className="mb-0"
            />
          </div>

          {/* Image Section */}
          {isFilled.image(image) && (
            <div
              className={cn(
                'flex items-center justify-center',
                isImageLeft ? 'lg:order-1' : 'lg:order-2'
              )}
            >
              <div className="bg-muted relative aspect-[4/3] w-full overflow-hidden rounded-(--card-radius) lg:aspect-[11/10]">
                <PrismicNextImage
                  field={image}
                  className="h-full w-full object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={isFirstSlice}
                />
              </div>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default HeadlineImageCta;
