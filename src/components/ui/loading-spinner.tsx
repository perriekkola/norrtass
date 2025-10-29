import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 24,
  className,
}) => {
  return (
    <Loader2
      size={size}
      className={cn('text-muted-foreground animate-spin', className)}
    />
  );
};
