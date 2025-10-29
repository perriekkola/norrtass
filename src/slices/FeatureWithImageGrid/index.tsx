'use client';

import { FC } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { PrismicNextImage } from '@prismicio/next';
import { SliceComponentProps } from '@prismicio/react';
import SVG from 'react-inlinesvg';

import { CustomRichText } from '@/components/custom-rich-text';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { SectionIntro } from '@/components/section-intro';
import { hasSectionIntroContent } from '@/lib/utils';

/**
 * Props for `FeatureWithImageGrid`.
 */
export type FeatureWithImageGridProps =
  SliceComponentProps<Content.FeatureWithImageGridSlice>;

/**
 * Component for "FeatureWithImageGrid" Slices.
 */
const FeatureWithImageGrid: FC<FeatureWithImageGridProps> = ({
  slice,
  index,
}) => {
  const {
    callout,
    title,
    description,
    features,
    main_image,
    tinted_background,
  } = slice.primary;
  const hasIntroContent = hasSectionIntroContent(slice);
  const featuresData = isFilled.group(features) ? features : [];
  const isFirstSlice = index === 0;

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      tintedBackground={tinted_background}
    >
      <Container>
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          {/* Left Column - Content & Features (60%) */}
          <div className="w-full">
            <div className="space-y-8">
              {/* Section Intro */}
              {hasIntroContent && (
                <SectionIntro
                  callout={callout}
                  title={title}
                  description={description}
                  align="left"
                  className="max-w-none"
                />
              )}

              {/* Features Grid */}
              {featuresData.length > 0 && (
                <div className="grid grid-cols-2 gap-6">
                  {featuresData.map((feature, index) => (
                    <div
                      key={index}
                      className="group flex flex-col items-start text-left"
                    >
                      {/* Icon */}
                      {isFilled.image(feature.icon) && (
                        <div className="bg-secondary mb-2 flex size-10 items-center justify-center rounded-md transition-colors lg:mb-4">
                          <SVG
                            src={feature.icon.url}
                            className="text-primary size-5"
                            title={feature.icon.alt}
                          />
                        </div>
                      )}

                      {/* Title */}
                      {feature.feature_title && (
                        <h3 className="mb-1 text-lg font-(--bold-text)">
                          {feature.feature_title}
                        </h3>
                      )}

                      {/* Description */}
                      {isFilled.richText(feature.feature_description) && (
                        <CustomRichText
                          field={feature.feature_description}
                          className="text-muted-foreground text-sm leading-relaxed"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Media */}
          {isFilled.image(main_image) && (
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-(--card-radius) lg:aspect-auto lg:max-w-2xl">
              <PrismicNextImage
                field={main_image}
                fill
                className="h-full w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={isFirstSlice}
              />
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default FeatureWithImageGrid;
