import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

import type { VariantProps } from 'class-variance-authority';

const taglineVariants = cva(
  'inline-flex items-center justify-center rounded-md border font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] shadow-xs overflow-hidden relative',
  {
    variants: {
      size: {
        sm: 'px-2.5 py-1 text-xs [&>svg]:size-2.5',
        default: 'px-4 py-1.5 text-sm [&>svg]:size-3',
        lg: 'px-5 py-2 text-base [&>svg]:size-4',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

function Tagline({
  className,
  size,
  gradient = false,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof taglineVariants> & {
    asChild?: boolean;
    gradient?: boolean;
  }) {
  const Comp = asChild ? Slot : 'span';

  if (gradient) {
    return (
      <div className="relative inline-flex rounded-full">
        <div className="from-primary/10 pointer-events-none absolute inset-0 rounded-md bg-gradient-to-r to-transparent" />
        <Comp
          data-slot="tagline"
          className={cn(taglineVariants({ size }), className)}
          {...props}
        >
          {children}
        </Comp>
      </div>
    );
  }

  return (
    <Comp
      data-slot="tagline"
      className={cn(taglineVariants({ size }), className)}
      {...props}
    >
      {children}
    </Comp>
  );
}

export { Tagline, taglineVariants };
