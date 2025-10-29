import { FC } from 'react';
import { Content } from '@prismicio/client';
import { SliceComponentProps } from '@prismicio/react';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { Spotlight } from '@/components/motion-primitives/spotlight';
import { SectionIntro } from '@/components/section-intro';
import { hasSectionIntroContent } from '@/lib/utils';

/**
 * Props for `CtaCard`.
 */
export type CtaCardProps = SliceComponentProps<Content.CtaCardSlice>;

/**
 * Component for "CtaCard" Slices.
 */
const CtaCard: FC<CtaCardProps> = ({ slice }) => {
  const { callout, title, description, buttons, tinted_background } =
    slice.primary;
  const hasIntroContent = hasSectionIntroContent(slice);

  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      tintedBackground={tinted_background}
      mobilePaddingless={tinted_background}
      className="first-of-type:pt-0"
    >
      <Container className="!px-0 sm:!px-(--container-padding-mobile) md:!px-(--container-padding-desktop)">
        <div className="bg-primary relative flex w-full flex-col items-center justify-center overflow-hidden px-5 py-12 text-center sm:rounded-(--card-radius) md:py-24">
          <Spotlight
            className="bg-radial from-white/10 to-transparent"
            size={600}
          />

          {/* CTA Content */}
          {hasIntroContent && (
            <div className="relative max-w-2xl">
              <SectionIntro
                callout={callout}
                title={title}
                description={description}
                buttons={buttons}
                align="center"
                className="prose-headings:text-primary-foreground prose-p:text-primary-foreground [&_.text-link]:text-primary-foreground"
                calloutClassName="border-background/20"
              />
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default CtaCard;
