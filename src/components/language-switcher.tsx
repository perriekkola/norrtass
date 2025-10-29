'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { generateHreflangUrls } from '@/lib/cms';
import {
  DEFAULT_LOCALE,
  LANGUAGE_NAMES,
  SUPPORTED_LOCALES,
} from '@/lib/locales';
import { cn } from '@/lib/utils';
import { createClient } from '@/prismicio';

interface LanguageUrl {
  locale: string;
  url: string;
}

export function LanguageSwitcher({
  showText = false,
  className,
  variant = 'ghost',
}: {
  showText?: boolean;
  className?: string;
  variant?: 'ghost' | 'outline' | 'secondary';
}) {
  const pathname = usePathname();
  const [languageUrls, setLanguageUrls] = useState<LanguageUrl[]>([]);
  const [currentLanguage, setCurrentLanguage] =
    useState<string>(DEFAULT_LOCALE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLanguageUrls = async () => {
      try {
        const client = createClient();

        // Get current page info from Next.js pathname
        const pathSegments = pathname.split('/').filter(Boolean);

        // Determine current language
        const currentLocale = SUPPORTED_LOCALES.includes(
          pathSegments[0] as (typeof SUPPORTED_LOCALES)[number]
        )
          ? pathSegments[0]
          : DEFAULT_LOCALE;
        setCurrentLanguage(currentLocale);

        // Extract the actual page UID
        let pageUid: string;
        if (currentLocale === DEFAULT_LOCALE) {
          pageUid =
            pathSegments.length > 0
              ? pathSegments[pathSegments.length - 1]
              : 'home';
        } else {
          pageUid =
            pathSegments.length > 1
              ? pathSegments[pathSegments.length - 1]
              : 'home';
        }

        if (pageUid === 'home') {
          // For home page, create URLs for all locales
          const urls: LanguageUrl[] = SUPPORTED_LOCALES.map((locale) => ({
            locale,
            url: locale === DEFAULT_LOCALE ? '/' : `/${locale}`,
          }));
          setLanguageUrls(urls);
        } else {
          // For other pages, try to find the current page and its alternates
          try {
            const currentPage = await client.getByUID('page', pageUid, {
              lang: currentLocale,
            });

            // Use the existing generateHreflangUrls function
            const hreflangUrls = await generateHreflangUrls(
              currentPage,
              currentLocale
            );

            // Convert hreflang URLs to our format, excluding x-default
            const hreflangUrlMap = new Map(
              hreflangUrls
                .filter((item) => item.lang !== 'x-default')
                .map((item) => [item.lang, item.url])
            );

            // Create URLs in the order of SUPPORTED_LOCALES
            const urls: LanguageUrl[] = SUPPORTED_LOCALES.map((locale) => ({
              locale,
              url:
                hreflangUrlMap.get(locale) ||
                (locale === DEFAULT_LOCALE ? '/' : `/${locale}`),
            }));

            setLanguageUrls(urls);
          } catch (_error) {
            // If page not found, create home page URLs for all locales
            const urls: LanguageUrl[] = SUPPORTED_LOCALES.map((locale) => ({
              locale,
              url: locale === DEFAULT_LOCALE ? '/' : `/${locale}`,
            }));
            setLanguageUrls(urls);
          }
        }
      } catch (error) {
        console.error('Failed to fetch language URLs:', error);
        // Fallback to home page URLs
        const urls: LanguageUrl[] = SUPPORTED_LOCALES.map((locale) => ({
          locale,
          url: locale === DEFAULT_LOCALE ? '/' : `/${locale}`,
        }));
        setLanguageUrls(urls);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLanguageUrls();
  }, [pathname]);

  // Don't render if there's only one locale
  if (SUPPORTED_LOCALES.length <= 1) {
    return null;
  }

  if (isLoading) {
    return (
      <Button
        variant={variant}
        size="icon"
        className={className}
        aria-label="Switch language"
        disabled
      >
        <Globe className="size-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          aria-label="Switch language"
          className={className}
        >
          <Globe className="size-4" />
          <span className="sr-only">Switch language</span>
          {showText && (
            <span>
              {LANGUAGE_NAMES[currentLanguage as keyof typeof LANGUAGE_NAMES] ||
                currentLanguage}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languageUrls.map(({ locale, url }) => {
          const isCurrentLanguage = locale === currentLanguage;

          return (
            <DropdownMenuItem key={locale} asChild disabled={isCurrentLanguage}>
              <a
                href={isCurrentLanguage ? '#' : url}
                className={cn(
                  'flex items-center justify-between',
                  isCurrentLanguage
                    ? 'cursor-default opacity-50'
                    : 'cursor-pointer'
                )}
                onClick={
                  isCurrentLanguage ? (e) => e.preventDefault() : undefined
                }
              >
                <span className="text-sm">
                  {LANGUAGE_NAMES[locale as keyof typeof LANGUAGE_NAMES] ||
                    locale}
                </span>
                {isCurrentLanguage && (
                  <div className="bg-foreground size-2 rounded-full" />
                )}
              </a>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
