import { FC } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { PrismicNextLink } from '@prismicio/next';
import { PrismicRichText, SliceComponentProps } from '@prismicio/react';
import { Check } from 'lucide-react';

import { CustomRichText } from '@/components/custom-rich-text';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { Spotlight } from '@/components/motion-primitives/spotlight';
import { SectionIntro } from '@/components/section-intro';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn, hasSectionIntroContent } from '@/lib/utils';

/**
 * Props for `PricingTable`.
 */
export type PricingTableProps = SliceComponentProps<Content.PricingTableSlice>;

/**
 * Component for "PricingTable" Slices.
 */
const PricingTable: FC<PricingTableProps> = ({ slice }) => {
  const plans = slice.primary.plans || [];
  const planCount = plans.length;
  const hasIntroContent = hasSectionIntroContent(slice);

  // Dynamic grid columns based on number of plans
  const getGridCols = () => {
    if (planCount === 1) return 'grid-cols-1 max-w-md mx-auto';
    if (planCount === 2) return 'grid-cols-1 max-w-md mx-auto';
    if (planCount === 3)
      return 'grid-cols-1 max-w-md mx-auto lg:max-w-none lg:grid-cols-3';
    if (planCount === 4)
      return 'grid-cols-1 max-w-md mx-auto lg:max-w-none lg:grid-cols-4';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-md mx-auto lg:max-w-none xl:grid-cols-4';
  };

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={cn(!hasIntroContent && 'py-6 lg:py-8')}
      tintedBackground={slice.primary.tinted_background}
    >
      <Container>
        <div className="mx-auto max-w-7xl space-y-8 lg:space-y-12">
          {/* Section Header */}
          {hasIntroContent && (
            <SectionIntro
              callout={slice.primary.callout}
              title={slice.primary.title}
              description={slice.primary.description}
              align="center"
              className="max-w-4xl"
            />
          )}

          {/* Pricing Cards */}
          {plans.length > 0 && (
            <div className={cn('grid gap-4', getGridCols())}>
              {plans.map((plan, index) => (
                <div key={index} className="relative">
                  <Card
                    spotlightClasses={cn(plan.is_featured && 'from-white')}
                    className={cn(
                      'flex h-full w-full flex-col px-2 py-7',
                      plan.is_featured && 'border-primary border-1'
                    )}
                  >
                    <Spotlight
                      className="from-foreground/5 bg-radial to-transparent"
                      size={600}
                    />

                    <CardHeader>
                      <div className="mb-1 flex justify-between gap-4">
                        {/* Plan Name */}
                        {isFilled.keyText(plan.plan_name) && (
                          <span className="text-foreground text-xl font-(--bold-text) lg:text-2xl">
                            {plan.plan_name}
                          </span>
                        )}

                        {/* Featured Badge */}
                        {plan.is_featured &&
                          isFilled.keyText(plan.featured_badge) && (
                            <Badge variant="default">
                              {plan.featured_badge}
                            </Badge>
                          )}
                      </div>

                      {/* Plan Description */}
                      {isFilled.richText(plan.plan_description) && (
                        <CustomRichText
                          field={plan.plan_description}
                          className="text-muted-foreground text-sm"
                        />
                      )}

                      {/* Pricing */}
                      <div className="flex items-end gap-1 pt-4">
                        {isFilled.keyText(plan.price) && (
                          <span className="text-foreground text-3xl font-bold lg:text-4xl">
                            {plan.price}
                          </span>
                        )}
                        {isFilled.keyText(plan.price_interval) && (
                          <span className="text-muted-foreground text-base">
                            {plan.price_interval}
                          </span>
                        )}
                      </div>

                      {/* CTA Button */}
                      {isFilled.link(plan.cta) && (
                        <div className="pt-2 pb-2">
                          <Button
                            variant={plan.is_featured ? 'default' : 'outline'}
                            size="lg"
                            className="w-full"
                            asChild
                          >
                            <PrismicNextLink field={plan.cta} />
                          </Button>
                        </div>
                      )}
                    </CardHeader>

                    <CardContent className="flex-1">
                      {/* Features Section */}
                      <div className="space-y-3">
                        {/* Feature Intro */}
                        {isFilled.keyText(plan.feature_intro) && (
                          <span className="text-foreground text-sm font-medium">
                            {plan.feature_intro}
                          </span>
                        )}

                        {/* Feature List */}
                        {isFilled.richText(plan.feature_list) && (
                          <div className="text-sm">
                            <PrismicRichText
                              field={plan.feature_list}
                              components={{
                                list: ({ children }) => (
                                  <ul className="space-y-2.5">{children}</ul>
                                ),
                                listItem: ({ children }) => (
                                  <li className="text-muted-foreground flex gap-1.5 leading-relaxed">
                                    <Check className="text-primary size-4 shrink-0 translate-y-[2px]" />
                                    <span>{children}</span>
                                  </li>
                                ),
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default PricingTable;
