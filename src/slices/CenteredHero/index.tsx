import { FC } from 'react';
import { Content } from '@prismicio/client';
import { SliceComponentProps } from '@prismicio/react';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { SectionIntro } from '@/components/section-intro';

/**
 * Props for `CenteredHero`.
 */
export type CenteredHeroProps = SliceComponentProps<Content.CenteredHeroSlice>;

/**
 * Component for "CenteredHero" Slices.
 */
const CenteredHero: FC<CenteredHeroProps> = ({ slice }) => {
  return (
    <Section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      tintedBackground={slice.primary.tinted_background}
    >
      <Container>
        <SectionIntro
          callout={slice.primary.callout}
          title={slice.primary.headline}
          description={slice.primary.description}
          buttons={slice.primary.buttons}
          align="center"
        />
      </Container>
    </Section>
  );
};

export default CenteredHero;
