'use client';

import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export function ModeToggle({
  className,
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Skeleton className="h-9 w-24" />;
  }

  return (
    <Tabs
      value={theme}
      onValueChange={setTheme}
      className={cn('w-fit', className)}
    >
      <TabsList className={cn('grid w-full grid-cols-3', className)}>
        <TabsTrigger value="light" aria-label="Light mode">
          <Sun />
          {showLabel && <span className="text-xs">Light</span>}
        </TabsTrigger>
        <TabsTrigger value="dark" aria-label="Dark mode">
          <Moon />
          {showLabel && <span className="text-xs">Dark</span>}
        </TabsTrigger>
        <TabsTrigger value="system" aria-label="System mode">
          <Monitor />
          {showLabel && <span className="text-xs">System</span>}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
