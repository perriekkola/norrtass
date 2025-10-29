'use client';

import { useEffect, useState } from 'react';
import { Cookie, Settings, X } from 'lucide-react';

import { useCookieBanner } from '@/components/cookie-banner-context';
import { CustomRichText } from '@/components/custom-rich-text';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

import { CookieBannerDocument } from '../../prismicio-types';

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag: (
      command: 'consent' | 'config' | 'js',
      action: string,
      parameters?: Record<string, string | boolean>
    ) => void;
    dataLayer: Record<string, unknown>[];
  }
}

interface CookiePreferences {
  necessary: boolean;
  analytics_storage: boolean;
  ad_storage: boolean;
}

export function CookieBanner({
  prismicData,
}: {
  prismicData: CookieBannerDocument;
}) {
  const { isVisible, hideCookieBanner } = useCookieBanner();
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics_storage: false,
    ad_storage: false,
  });

  useEffect(() => {
    // Initialize default consent (denied) when component mounts
    initializeDefaultConsent();

    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (cookieConsent) {
      // Apply existing consent preferences
      const existingPrefs = JSON.parse(cookieConsent) as CookiePreferences;
      updateGtagConsent(existingPrefs);
      setPreferences(existingPrefs);
    }
  }, []);

  const initializeDefaultConsent = () => {
    // Set default consent to 'denied' as recommended by Google
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
      });
    }
  };

  const handleAcceptAll = () => {
    const allPreferences: CookiePreferences = {
      necessary: true,
      analytics_storage: true,
      ad_storage: true,
    };
    saveCookiePreferences(allPreferences);
    hideCookieBanner();
  };

  const handleAcceptNecessaryOnly = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics_storage: false,
      ad_storage: false,
    };
    saveCookiePreferences(necessaryOnly);
    hideCookieBanner();
  };

  const handleCustomizePreferences = () => {
    setShowCustomize(true);
  };

  const handleSaveCustomPreferences = () => {
    saveCookiePreferences(preferences);
    hideCookieBanner();
  };

  const saveCookiePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());

    // Update Google Tag Manager consent
    updateGtagConsent(prefs);
  };

  const updateGtagConsent = (prefs: CookiePreferences) => {
    // Check if gtag is available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: prefs.analytics_storage ? 'granted' : 'denied',
        ad_storage: prefs.ad_storage ? 'granted' : 'denied',
        ad_user_data: prefs.ad_storage ? 'granted' : 'denied',
        ad_personalization: prefs.ad_storage ? 'granted' : 'denied',
      });

      // Push consent event to dataLayer for GTM triggers
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'cookie_consent_update',
        consent_analytics: prefs.analytics_storage,
        consent_advertising: prefs.ad_storage,
        consent_necessary: prefs.necessary,
      });
    } else {
      console.warn('gtag not available - consent not updated');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 z-50 w-full sm:p-4">
      <div className="bg-card pointer-events-auto relative w-full max-w-2xl border shadow-xl sm:rounded-(--card-radius)">
        <div className="container max-w-4xl px-4 py-4">
          {!showCustomize ? (
            // Main cookie banner
            <div className="flex flex-col gap-4 md:justify-between">
              <div className="flex flex-1 flex-col items-start gap-1">
                <Cookie className="text-primary mt-0.5 mb-2 size-5 shrink-0" />
                {/* Title from CMS */}
                {prismicData.data.title && (
                  <CustomRichText
                    field={prismicData.data.title}
                    className="text-lg font-(--bold-text)"
                  />
                )}
                {/* Description from CMS */}
                {prismicData.data.description && (
                  <CustomRichText
                    field={prismicData.data.description}
                    className="text-muted-foreground text-sm"
                  />
                )}
              </div>

              <div className="flex flex-col gap-2 md:flex-row">
                <Button
                  variant="outline"
                  onClick={handleCustomizePreferences}
                  className="order-3 md:order-1"
                >
                  <Settings className="size-4" />
                  {prismicData.data.customize_label || 'Customize preferences'}
                </Button>
                <Button
                  onClick={handleAcceptNecessaryOnly}
                  className="order-2 md:ml-auto"
                >
                  {prismicData.data.accept_necessary_label ||
                    'Accept necessary'}
                </Button>
                <Button
                  onClick={handleAcceptAll}
                  className="order-1 md:order-3"
                >
                  {prismicData.data.accept_all_label || 'Accept all cookies'}
                </Button>
              </div>
            </div>
          ) : (
            // Customize preferences view
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="text-primary size-5" />
                  <h4 className="text-sm font-(--bold-text)">
                    {prismicData.data.customize_label ||
                      'Customize Cookie Preferences'}
                  </h4>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCustomize(false)}
                >
                  <X className="size-4" />
                  <span className="sr-only">Back</span>
                </Button>
              </div>

              <div className="space-y-1">
                {/* Dynamic cookie types from CMS */}
                {prismicData.data.cookie_types?.map((cookieType, index) => {
                  const title = cookieType.title || '';
                  const cookieId = cookieType.cookie_id || '';

                  // Map cookie_id to preference key
                  let preferenceKey: keyof CookiePreferences;
                  switch (cookieId) {
                    case 'necessary':
                      preferenceKey = 'necessary';
                      break;
                    case 'analytics_storage':
                      preferenceKey = 'analytics_storage';
                      break;
                    case 'ad_storage':
                      preferenceKey = 'ad_storage';
                      break;
                    default:
                      preferenceKey = 'analytics_storage'; // fallback
                  }

                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between gap-4 rounded-lg border p-3 ${
                        cookieType.checked_and_disabled ? 'bg-muted/30' : ''
                      }`}
                    >
                      <div className="max-w-md flex-1 space-y-1">
                        <h5 className="text-sm font-medium">{title}</h5>
                        {cookieType.description && (
                          <CustomRichText
                            field={cookieType.description}
                            className="text-muted-foreground text-xs"
                          />
                        )}
                      </div>
                      <Switch
                        checked={
                          cookieType.checked_and_disabled
                            ? true
                            : preferences[preferenceKey]
                        }
                        disabled={cookieType.checked_and_disabled}
                        onCheckedChange={(checked: boolean) =>
                          setPreferences((prev) => ({
                            ...prev,
                            [preferenceKey]: checked,
                          }))
                        }
                        aria-label={`${title} cookies`}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2 pt-2 md:flex-row md:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowCustomize(false)}
                  className="order-2 md:order-1"
                >
                  {prismicData.data.cancel_label || 'Cancel'}
                </Button>
                <Button
                  onClick={handleSaveCustomPreferences}
                  className="order-1 md:order-2"
                >
                  {prismicData.data.save_preferences_label ||
                    'Save preferences'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
