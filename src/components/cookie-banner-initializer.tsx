'use client';

import { useEffect } from 'react';

import { useCookieBanner } from './cookie-banner-context';

export function CookieBannerInitializer() {
  const { showCookieBanner } = useCookieBanner();

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (!cookieConsent) {
      // Show banner if no consent has been given
      showCookieBanner();
    }
  }, [showCookieBanner]);

  return null;
}
