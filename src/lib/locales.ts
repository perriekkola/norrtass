/**
 * Supported locales for the application
 */
export const SUPPORTED_LOCALES = ['sv-se'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Language names for display in the language switcher
 */
export const LANGUAGE_NAMES: Record<SupportedLocale, string> = {
  'sv-se': 'Svenska',
} as const;

/**
 * Default locale (master locale)
 */
export const DEFAULT_LOCALE: SupportedLocale = 'sv-se';

/**
 * Validates if a locale is supported
 */
export function isValidLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

/**
 * Gets the locale from URL slug segments
 */
export function getLocaleFromSlug(slug?: string[]): SupportedLocale {
  if (slug && slug.length > 0 && isValidLocale(slug[0])) {
    return slug[0];
  }
  return DEFAULT_LOCALE;
}

/**
 * Helper function to parse locale and UID from URL slug segments
 */
export function parseSlugParams(slug?: string[]) {
  const locale = getLocaleFromSlug(slug);
  const uid =
    !slug || slug.length === 0
      ? 'home'
      : isValidLocale(slug[0])
        ? slug[1] || 'home' // If first segment is locale, UID is second segment (or "home")
        : slug[0]; // If first segment is not locale, it's the UID

  return { locale, uid };
}

/**
 * Extracts the language code from a locale (e.g., "sv-se" -> "sv")
 */
export function getLanguageCode(locale: SupportedLocale): string {
  return locale.split('-')[0];
}

/**
 * Gets the display name for a locale
 */
export function getLanguageName(locale: SupportedLocale): string {
  return LANGUAGE_NAMES[locale];
}
