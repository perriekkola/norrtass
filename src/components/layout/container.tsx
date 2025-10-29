import { cn } from '@/lib/utils';

const Container = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn('container', className)}>{children}</div>;
};

export { Container };
