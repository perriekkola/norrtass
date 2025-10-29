'use client';

import { FC } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { PrismicNextImage } from '@prismicio/next';
import { SliceComponentProps } from '@prismicio/react';

import { CustomRichText } from '@/components/custom-rich-text';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { StarRating } from '@/components/ui/star-rating';

/**
 * Props for `TestimonialDetail`.
 */
export type TestimonialDetailProps =
  SliceComponentProps<Content.TestimonialDetailSlice>;

/**
 * Component for "TestimonialDetail" Slices.
 */
const TestimonialDetail: FC<TestimonialDetailProps> = ({ slice }) => {
  const {
    author_image,
    rating,
    quote,
    author_name,
    author_role,
    tinted_background,
  } = slice.primary;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      tintedBackground={tinted_background}
    >
      <Container>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Author Image */}
          <div className="flex items-center justify-center">
            {isFilled.image(author_image) && (
              <div className="bg-muted relative aspect-square w-full overflow-hidden rounded-(--card-radius)">
                <PrismicNextImage
                  field={author_image}
                  fill
                  className="aspect-square w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            )}
          </div>

          {/* Right Column - Testimonial Content */}
          <div className="flex flex-col justify-center space-y-6">
            {/* Rating Stars */}
            {typeof rating === 'number' && rating > 0 && (
              <StarRating rating={Math.min(Math.max(rating, 0), 5)} />
            )}

            {/* Quote */}
            {isFilled.richText(quote) && (
              <CustomRichText
                field={quote}
                className="text-foreground text-xl md:text-2xl"
              />
            )}

            {/* Author Info */}
            <div>
              {author_name && (
                <div className="text-foreground text-lg font-(--bold-text)">
                  {author_name}
                </div>
              )}
              {author_role && (
                <div className="text-muted-foreground">{author_role}</div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default TestimonialDetail;
