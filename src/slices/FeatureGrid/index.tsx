import { FC } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { PrismicNextLink } from '@prismicio/next';
import { SliceComponentProps } from '@prismicio/react';
import { ChevronRight } from 'lucide-react';
import SVG from 'react-inlinesvg';

import { CustomRichText } from '@/components/custom-rich-text';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { SectionIntro } from '@/components/section-intro';
import { Button } from '@/components/ui/button';

/**
 * Props for `FeatureGrid`.
 */
export type FeatureGridProps = SliceComponentProps<Content.FeatureGridSlice>;

/**
 * Component for "FeatureGrid" Slices.
 */
const FeatureGrid: FC<FeatureGridProps> = ({ slice }) => {
  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      tintedBackground={slice.primary.tinted_background}
    >
      <Container>
        <div className="mx-auto max-w-7xl space-y-8 lg:space-y-12">
          <SectionIntro
            title={slice.primary.headline}
            className="max-w-3xl"
            align="left"
            callout={slice.primary.callout}
          />

          {/* Features Grid */}
          {slice.primary.features && slice.primary.features.length > 0 && (
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-3 lg:gap-12">
              {slice.primary.features.map((feature, index) => (
                <div
                  key={index}
                  className="group flex flex-col items-start text-left"
                >
                  {/* Icon */}
                  {feature.icon && feature.icon.url && (
                    <div className="bg-secondary mb-2 flex size-10 items-center justify-center rounded-md lg:mb-4">
                      <SVG
                        src={feature.icon.url}
                        className="text-primary size-5"
                        title={feature.icon.alt}
                      />
                    </div>
                  )}

                  {/* Title */}
                  {feature.title && (
                    <h3 className="mb-1 text-lg font-(--bold-text) lg:text-xl">
                      {feature.title}
                    </h3>
                  )}

                  {/* Description */}
                  {isFilled.richText(feature.description) && (
                    <CustomRichText
                      field={feature.description}
                      className="text-muted-foreground text-sm leading-relaxed lg:text-base"
                    />
                  )}

                  {/* Button */}
                  {isFilled.link(feature.button) && (
                    <div className="mt-4">
                      <Button asChild variant="outline">
                        <PrismicNextLink field={feature.button}>
                          {feature.button.text}
                          <ChevronRight />
                        </PrismicNextLink>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default FeatureGrid;
