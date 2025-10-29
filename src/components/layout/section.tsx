import { cn } from '@/lib/utils';

const Section = ({
  children,
  className,
  tintedBackground = false,
  mobilePaddingless = false,
}: {
  children: React.ReactNode;
  className?: string;
  tintedBackground?: boolean;
  mobilePaddingless?: boolean;
}) => {
  return (
    <section
      className={cn(
        tintedBackground
          ? 'my-8 bg-(--tinted-bg) bg-linear-to-b py-[calc(var(--section-padding-mobile)+16px)] lg:my-12 lg:py-[calc(var(--section-padding-desktop)+40px)]'
          : tintedBackground && !mobilePaddingless
            ? 'my-8 py-[calc(var(--section-padding-mobile)+16px)] lg:my-12 lg:py-[calc(var(--section-padding-desktop)+40px)]'
            : 'bg-background py-(--section-padding-mobile) lg:py-(--section-padding-desktop)',
        className
      )}
    >
      {children}
    </section>
  );
};

export { Section };
