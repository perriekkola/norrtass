import { type FC } from 'react';
import { type Content } from '@prismicio/client';

import { CustomRichText } from '@/components/custom-rich-text';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';

import type { SliceComponentProps } from '@prismicio/react';

/**
 * Props for `RichText`.
 */
type RichTextProps = SliceComponentProps<Content.RichTextSlice>;

/**
 * Component for "RichText" Slices.
 */
const RichText: FC<RichTextProps> = ({ slice }) => {
  return (
    <Section tintedBackground={slice.primary.tinted_background}>
      <Container className="max-w-3xl">
        <CustomRichText
          className="prose-h2:!text-3xl lg:prose-h2:!text-4xl"
          field={slice.primary.content}
        />
      </Container>
    </Section>
  );
};

export default RichText;
