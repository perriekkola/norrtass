import { RichTextField } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';

import { cn } from '@/lib/utils';

import { components } from './rich-text-components';

interface CustomRichTextProps {
  field: RichTextField;
  className?: string;
}

export function CustomRichText({ field, className }: CustomRichTextProps) {
  return (
    <div
      className={cn(
        'prose dark:prose-invert text-muted-foreground prose-headings:text-foreground',
        className
      )}
    >
      <PrismicRichText field={field} components={components} />
    </div>
  );
}
