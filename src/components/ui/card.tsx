import * as React from 'react';

import { Spotlight } from '@/components/motion-primitives/spotlight';
import { cn } from '@/lib/utils';

function Card({
  className,
  spotlightClasses,
  ...props
}: React.ComponentProps<'div'> & {
  spotlightClasses?: string;
}) {
  return (
    <div className="bg-border h-full w-full rounded-(--card-radius) p-[1px]">
      <Spotlight
        className={cn('from-primary bg-radial', spotlightClasses)}
        size={200}
      />

      <div
        data-slot="card"
        className={cn(
          'bg-card text-card-foreground relative flex flex-col gap-4 rounded-(--card-radius) py-6 shadow-sm lg:gap-5',
          className
        )}
        {...props}
      />
    </div>
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] lg:px-6 [.border-b]:pb-6',
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('leading-none font-(--bold-text)', className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-4 lg:px-6', className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'flex items-center px-4 lg:px-6 [.border-t]:pt-6',
        className
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
