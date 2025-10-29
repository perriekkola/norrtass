import { FC } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { PrismicNextLink } from '@prismicio/next';
import { SliceComponentProps } from '@prismicio/react';
import SVG from 'react-inlinesvg';

import { CustomRichText } from '@/components/custom-rich-text';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { SectionIntro } from '@/components/section-intro';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { hasSectionIntroContent } from '@/lib/utils';

/**
 * Props for `FeatureGrid3`.
 */
export type FeatureGrid3Props = SliceComponentProps<Content.FeatureGrid3Slice>;

/**
 * Component for "FeatureGrid3" Slices.
 */
const FeatureGrid3: FC<FeatureGrid3Props> = ({ slice }) => {
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
              align="center"
            />
          )}

          {/* Features Grid */}
          {isFilled.group(features) && features.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {features.map((feature, index) => (
                <Card key={index} className="py-8 text-center md:py-10">
                  <CardHeader>
                    {/* Feature Icon */}
                    {isFilled.image(feature.icon) && (
                      <div className="bg-secondary mx-auto flex size-10 items-center justify-center rounded-lg border">
                        <SVG
                          src={feature.icon.url}
                          className="text-primary size-5"
                          title={feature.icon.alt}
                        />
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="flex-1 space-y-2">
                    {/* Feature Title */}
                    {isFilled.keyText(feature.feature_title) && (
                      <h3 className="text-foreground text-xl font-(--bold-text) lg:text-2xl">
                        {feature.feature_title}
                      </h3>
                    )}

                    {/* Feature Description */}
                    {isFilled.richText(feature.feature_description) && (
                      <CustomRichText
                        className="text-muted-foreground mx-auto max-w-[16rem] text-sm"
                        field={feature.feature_description}
                      />
                    )}
                  </CardContent>

                  {/* Feature Link/Button */}
                  {isFilled.link(feature.feature_link) && (
                    <CardFooter className="justify-center pt-2">
                      <Button asChild className="w-auto">
                        <PrismicNextLink field={feature.feature_link} />
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default FeatureGrid3;
