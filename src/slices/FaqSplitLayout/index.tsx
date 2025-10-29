import { FC } from 'react';
import { asText, Content, isFilled } from '@prismicio/client';
import { SliceComponentProps } from '@prismicio/react';

import { CustomRichText } from '@/components/custom-rich-text';
import { FAQSchema } from '@/components/faq-schema';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { SectionIntro } from '@/components/section-intro';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/**
 * Props for `FaqSplitLayout`.
 */
export type FaqSplitLayoutProps =
  SliceComponentProps<Content.FaqSplitLayoutSlice>;

/**
 * Component for "FaqSplitLayout" Slices.
 */
const FaqSplitLayout: FC<FaqSplitLayoutProps> = ({ slice }) => {
  const { callout, title, description, faqs, tinted_background } =
    slice.primary;

  // Prepare FAQ items for schema
  const faqItems = isFilled.group(faqs)
    ? faqs
        .filter(
          (faq) =>
            isFilled.richText(faq.question) && isFilled.richText(faq.answer)
        )
        .map((faq) => ({
          question: asText(faq.question) || '',
          answer: asText(faq.answer) || '',
        }))
    : [];

  return (
    <>
      {/* FAQ Schema for SEO */}
      <FAQSchema items={faqItems} />

      <Section tintedBackground={tinted_background}>
        <Container>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
            {/* Left Column - Content */}
            <SectionIntro
              callout={callout}
              title={title}
              description={description}
              align="left"
              className="max-w-2xl"
            />

            {/* Right Column - FAQ Accordion */}
            {isFilled.group(faqs) && faqs.length > 0 && (
              <div className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`faq-${index}`}
                      className="border-border"
                    >
                      <AccordionTrigger className="text-left">
                        {isFilled.richText(faq.question) && (
                          <CustomRichText
                            field={faq.question}
                            className="prose-headings:!mb-0 prose-headings:!mt-0 prose-p:!mb-0 prose-h3:!text-lg"
                          />
                        )}
                      </AccordionTrigger>
                      <AccordionContent>
                        {isFilled.richText(faq.answer) && (
                          <CustomRichText
                            field={faq.answer}
                            className="text-sm"
                          />
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
};

export default FaqSplitLayout;
