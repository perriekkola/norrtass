import { PrismicNextLink } from '@prismicio/next';
import { JSXMapSerializer } from '@prismicio/react';

import { Button } from '@/components/ui/button';

export const components: JSXMapSerializer = {
  hyperlink: ({ node, children }) => {
    return (
      <Button variant="link" size="link" asChild>
        <PrismicNextLink field={node.data}>{children}</PrismicNextLink>
      </Button>
    );
  },
  label: ({ node, children }) => {
    if (node.data.label === 'codespan') {
      return (
        <code className="bg-accent rounded-md px-1 py-0.5">{children}</code>
      );
    } else if (node.data.label === 'hr') {
      return <span className="bg-border my-8 block h-px w-full" />;
    }
  },
};
