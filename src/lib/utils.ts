import { isFilled, LinkField, RichTextField } from '@prismicio/client';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Helper function to check if any section intro fields are filled
 * Works with any slice that has callout, title, description, and buttons fields
 */
export function hasSectionIntroContent(slice: {
  primary: {
    callout?: RichTextField;
    title?: RichTextField;
    description?: RichTextField;
    buttons?:
      | LinkField<string, string, unknown>[]
      | LinkField<string, string, unknown>;
  };
}) {
  const { callout, title, description, buttons } = slice.primary;

  return (
    isFilled.richText(callout) ||
    isFilled.richText(title) ||
    isFilled.richText(description) ||
    (buttons &&
      (Array.isArray(buttons)
        ? buttons.some((button) => isFilled.link(button))
        : isFilled.link(buttons)))
  );
}

/**
 * Format price based on locale and currency
 * @param price - Price in actual currency units (e.g., 199 for $199.00)
 * @param currency - Currency code (e.g., 'USD', 'SEK')
 * @param locale - Locale string (e.g., 'en-us', 'sv-se')
 * @returns Formatted price string
 */
export function formatPrice(
  price: number,
  currency: string,
  locale: string = 'en-us'
): string {
  // Convert locale format (sv-se -> sv-SE, en-us -> en-US) to match API
  const localeCode = locale
    .split('-')
    .map((part, index) =>
      index === 0 ? part.toLowerCase() : part.toUpperCase()
    )
    .join('-');

  return new Intl.NumberFormat(localeCode, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0, // Ensure no decimal places are shown
    maximumFractionDigits: 0, // Ensure no decimal places are shown
  }).format(price); // No division needed
}
