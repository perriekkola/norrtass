import { FC } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { PrismicNextImage, PrismicNextLink } from '@prismicio/next';
import { SliceComponentProps } from '@prismicio/react';
import { ChevronRight } from 'lucide-react';
import SVG from 'react-inlinesvg';

import { CustomRichText } from '@/components/custom-rich-text';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { ProgressiveBlur } from '@/components/motion-primitives/progressive-blur';
import { SectionIntro } from '@/components/section-intro';
import { Button } from '@/components/ui/button';
import { cn, hasSectionIntroContent } from '@/lib/utils';

/**
 * Props for `FeatureGridShowcase`.
 */
export type FeatureGridShowcaseProps =
  SliceComponentProps<Content.FeatureGridShowcaseSlice>;

/**
 * Component for "FeatureGridShowcase" Slices.
 */
const FeatureGridShowcase: FC<FeatureGridShowcaseProps> = ({ slice }) => {
  const { callout, title, description, features, tinted_background } =
    slice.primary;

  // Check if section intro has content
  const hasIntroContent = hasSectionIntroContent(slice);

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      tintedBackground={tinted_background}
    >
      <Container>
        <div className="mx-auto max-w-7xl">
          {hasIntroContent && (
            <SectionIntro
              callout={callout}
              title={title}
              description={description}
              align="center"
              className="mb-8 lg:mb-16"
            />
          )}

          {isFilled.group(features) && features.length > 0 && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {features.map((feature, index) => {
                const isLarge = feature.size === 'large';

                return (
                  <PrismicNextLink
                    key={index}
                    field={feature.button}
                    className={cn(
                      'group relative flex min-h-[224px] flex-col justify-end overflow-hidden rounded-(--card-radius) p-6 lg:min-h-[440px] lg:p-8',
                      isLarge ? 'lg:col-span-2' : 'lg:col-span-1'
                    )}
                  >
                    {/* Background Image */}
                    {isFilled.image(feature.image) && (
                      <div className="absolute inset-0 h-full w-full">
                        <PrismicNextImage
                          field={feature.image}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[105%]"
                          sizes={
                            isLarge
                              ? '(max-width: 768px) 100vw, 66vw'
                              : '(max-width: 768px) 100vw, 33vw'
                          }
                        />

                        {/* Gradient Overlay */}
                        {feature.add_overlay && (
                          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
                        )}

                        {/* Progressive Blur at Bottom */}
                        <div className="absolute right-0 bottom-0 left-0 h-2/3">
                          <ProgressiveBlur
                            direction="bottom"
                            blurLayers={4}
                            blurIntensity={0.8}
                            className="h-full"
                          />
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="relative flex max-w-md flex-col">
                      <div className="relative z-10 space-y-2">
                        {/* Icon */}
                        {isFilled.image(feature.icon) && (
                          <div className="mb-4 flex size-10 items-center justify-center rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm">
                            <SVG
                              src={feature.icon.url}
                              className="size-5 text-white"
                              title={feature.icon.alt}
                            />
                          </div>
                        )}

                        {/* Title */}
                        {feature.title && (
                          <h3 className="text-3xl font-(--bold-text) text-white lg:text-5xl">
                            {feature.title}
                          </h3>
                        )}

                        {/* Description */}
                        {isFilled.richText(feature.description) && (
                          <CustomRichText
                            className="text-white/90"
                            field={feature.description}
                          />
                        )}

                        {/* Button */}
                        {isFilled.link(feature.button) && (
                          <div className="mt-4">
                            <Button variant="secondary" asChild>
                              <div>
                                {feature.button.text || 'Get started'}
                                <ChevronRight />
                              </div>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </PrismicNextLink>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default FeatureGridShowcase;
