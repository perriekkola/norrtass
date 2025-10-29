'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

interface CookieBannerContextType {
  isVisible: boolean;
  showCookieBanner: () => void;
  hideCookieBanner: () => void;
  toggleCookieBanner: () => void;
}

const CookieBannerContext = createContext<CookieBannerContextType | undefined>(
  undefined
);

export function CookieBannerProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);

  const showCookieBanner = () => setIsVisible(true);
  const hideCookieBanner = () => setIsVisible(false);
  const toggleCookieBanner = () => setIsVisible(!isVisible);

  return (
    <CookieBannerContext.Provider
      value={{
        isVisible,
        showCookieBanner,
        hideCookieBanner,
        toggleCookieBanner,
      }}
    >
      {children}
    </CookieBannerContext.Provider>
  );
}

export function useCookieBanner() {
  const context = useContext(CookieBannerContext);
  if (context === undefined) {
    throw new Error(
      'useCookieBanner must be used within a CookieBannerProvider'
    );
  }
  return context;
}
