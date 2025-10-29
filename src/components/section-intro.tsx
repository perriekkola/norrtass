import { isFilled, LinkField, RichTextField } from '@prismicio/client';
import { PrismicNextLink } from '@prismicio/next';
import { ChevronRight } from 'lucide-react';

import { CustomRichText } from '@/components/custom-rich-text';
import { Button } from '@/components/ui/button';
import { Tagline } from '@/components/ui/tagline';
import { cn } from '@/lib/utils';

interface SectionIntroProps {
  callout?: RichTextField;
  title?: RichTextField;
  description?: RichTextField;
  buttons?: Array<
    LinkField & { variant?: 'default' | 'secondary' | 'outline' | 'ghost' }
  >;
  align?: 'left' | 'center';
  className?: string;
  calloutClassName?: string;
}

export function SectionIntro({
  callout,
  title,
  description,
  buttons,
  align = 'center',
  className,
  calloutClassName,
}: SectionIntroProps) {
  const isLeftAligned = align === 'left';

  return (
    <div
      className={cn(
        'flex max-w-4xl flex-col',
        isLeftAligned ? 'text-left' : 'mx-auto items-center text-center',
        className
      )}
    >
      {/* Callout */}
      {isFilled.richText(callout) && (
        <div className="mb-4">
          <Tagline size="sm" gradient className={calloutClassName}>
            <CustomRichText className="text-sm" field={callout} />
          </Tagline>
        </div>
      )}

      {/* Title */}
      {isFilled.richText(title) && (
        <CustomRichText className="max-w-none" field={title} />
      )}

      {/* Description */}
      {isFilled.richText(description) && (
        <CustomRichText className="max-w-xl" field={description} />
      )}

      {/* Buttons */}
      {buttons && buttons.length > 0 && (
        <div
          className={cn(
            'mt-6 flex flex-col gap-2 sm:flex-row md:gap-4',
            isLeftAligned ? 'items-start' : 'sm:justify-center md:w-auto'
          )}
        >
          {buttons.map((button, index) => {
            if (!isFilled.link(button)) return null;

            return (
              <Button key={index} variant={button.variant} size="lg" asChild>
                <PrismicNextLink field={button}>
                  {button.text}
                  <ChevronRight />
                </PrismicNextLink>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
