import { FC } from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicNextLink } from '@prismicio/next';
import { ChevronRight } from 'lucide-react';
import SVG from 'react-inlinesvg';

import { CustomRichText } from '@/components/custom-rich-text';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { Spotlight } from '@/components/motion-primitives/spotlight';
import { SectionIntro } from '@/components/section-intro';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn, hasSectionIntroContent } from '@/lib/utils';

import { MegaCardsSlice } from '../../../prismicio-types';

type MegaCardsProps = {
  slice: MegaCardsSlice;
};

const MegaCards: FC<MegaCardsProps> = ({ slice }) => {
  const { callout, title, description, buttons, cards, tinted_background } =
    slice.primary;
  const hasIntroContent = hasSectionIntroContent(slice);
  const cardItems = isFilled.group(cards) ? cards : [];
  const itemCount = cardItems.length;

  // Dynamic grid columns based on number of cards
  const getGridCols = () => {
    if (itemCount === 1) return 'grid-cols-1';
    if (itemCount === 2) return 'grid-cols-1 md:grid-cols-2';
    if (itemCount === 3) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    if (itemCount === 4) return 'grid-cols-1 md:grid-cols-2';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  };

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
              buttons={buttons}
              align="center"
            />
          )}

          {/* Cards Grid */}
          {cardItems.length > 0 && (
            <div className={cn('grid gap-4', getGridCols())}>
              {cardItems.map((card, index) => (
                <Card
                  key={index}
                  className={cn(
                    'flex h-full min-h-[288px] flex-col justify-between overflow-hidden rounded-2xl p-5 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] md:p-8 lg:min-h-[448px]',
                    card.background === 'secondary' ? 'bg-accent' : 'bg-primary'
                  )}
                >
                  <Spotlight
                    className={cn(
                      'from-primary/15 bg-radial to-transparent',
                      card.background === 'primary' && 'from-white/15'
                    )}
                    size={600}
                  />

                  {/* Top Section: Title and Icon */}
                  <div className="relative flex w-full items-start justify-between gap-4">
                    {/* Card Title */}
                    {isFilled.richText(card.title) && (
                      <CustomRichText
                        field={card.title}
                        className={cn(
                          'prose-h2:!text-3xl lg:prose-h2:!text-5xl max-w-sm leading-[105%] font-(--bold-text)',
                          card.background === 'primary' &&
                            'prose-headings:text-primary-foreground'
                        )}
                      />
                    )}

                    {/* Card Icon */}
                    {isFilled.image(card.icon) && (
                      <div
                        className={cn(
                          'flex size-12 shrink-0 items-center justify-center rounded-lg shadow-xs lg:size-14',
                          card.background === 'secondary'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-primary'
                        )}
                      >
                        <SVG
                          src={card.icon.url}
                          className="size-6 lg:size-7"
                          title={card.icon.alt}
                        />
                      </div>
                    )}
                  </div>

                  {/* Bottom Section: Description and Button */}
                  <div className="relative flex w-full flex-col gap-4">
                    {/* Card Description */}
                    {isFilled.richText(card.description) && (
                      <CustomRichText
                        field={card.description}
                        className={cn(
                          'max-w-lg text-lg lg:text-2xl',
                          card.background === 'primary' &&
                            'text-primary-foreground'
                        )}
                      />
                    )}

                    {/* Card Button */}
                    {isFilled.link(card.button) && (
                      <div className="shrink-0">
                        <Button
                          asChild
                          variant={
                            card.background === 'primary'
                              ? 'secondary'
                              : 'default'
                          }
                          size="lg"
                          className="h-12 px-8"
                        >
                          <PrismicNextLink field={card.button}>
                            {card.button.text}
                            <ChevronRight className="ml-2 size-4" />
                          </PrismicNextLink>
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default MegaCards;
