import { FC } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { PrismicNextImage, PrismicNextLink } from '@prismicio/next';
import { SliceComponentProps } from '@prismicio/react';
import { ChevronRight } from 'lucide-react';

import { CustomRichText } from '@/components/custom-rich-text';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { SectionIntro } from '@/components/section-intro';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { hasSectionIntroContent } from '@/lib/utils';

/**
 * Props for `FeatureGrid2`.
 */
export type FeatureGrid2Props = SliceComponentProps<Content.FeatureGrid2Slice>;

/**
 * Component for "FeatureGrid2" Slices.
 */
const FeatureGrid2: FC<FeatureGrid2Props> = ({ slice }) => {
  const { callout, title, description, features, tinted_background } =
    slice.primary;

  const hasIntroContent = hasSectionIntroContent(slice);

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      tintedBackground={tinted_background}
    >
      <Container>
        <div className="mx-auto max-w-7xl space-y-8 lg:space-y-12">
          {/* Section Intro */}
          {hasIntroContent && (
            <SectionIntro
              callout={callout}
              title={title}
              description={description}
            />
          )}

          {/* Features Grid */}
          {isFilled.group(features) && features.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {features.map((feature, index) => (
                <PrismicNextLink
                  key={index}
                  field={feature.feature_link}
                  className="group"
                >
                  <Card className="pt-0">
                    {/* Feature Image */}
                    {isFilled.image(feature.image) && (
                      <div className="bg-muted flex aspect-video w-full items-center justify-center overflow-hidden">
                        <PrismicNextImage
                          field={feature.image}
                          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    )}

                    {/* Feature Content */}
                    {(isFilled.keyText(feature.feature_title) ||
                      isFilled.richText(feature.feature_description)) && (
                      <CardHeader>
                        {/* Feature Title */}
                        {isFilled.keyText(feature.feature_title) && (
                          <CardTitle>
                            <h3 className="text-lg font-(--bold-text) lg:text-xl">
                              {feature.feature_title}
                            </h3>
                          </CardTitle>
                        )}

                        {/* Feature Description */}
                        {isFilled.richText(feature.feature_description) && (
                          <CardDescription>
                            <CustomRichText
                              className="text-sm lg:text-base"
                              field={feature.feature_description}
                            />
                          </CardDescription>
                        )}
                      </CardHeader>
                    )}

                    {/* Feature Link/Button - Now displays link text */}
                    {isFilled.link(feature.feature_link) && (
                      <CardFooter>
                        <Button asChild>
                          <div>
                            {feature.feature_link.text || 'Get started'}
                            <ChevronRight />
                          </div>
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                </PrismicNextLink>
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default FeatureGrid2;
