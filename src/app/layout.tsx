import { Bricolage_Grotesque } from 'next/font/google';
import { headers } from 'next/headers';
import { PrismicPreview } from '@prismicio/next';

import { CookieBanner } from '@/components/cookie-banner';
import { CookieBannerProvider } from '@/components/cookie-banner-context';
import { CookieBannerInitializer } from '@/components/cookie-banner-initializer';
import { Footer } from '@/components/footer';
import { GoogleTagManager } from '@/components/google-tag-manager';
import { Navbar } from '@/components/navbar';
import { ThemeProvider } from '@/components/theme-provider';
import { CartProvider } from '@/contexts/cart-context';
import { getCookieBannerData, getFooterData, getNavbarData } from '@/lib/cms';
import { DEFAULT_LOCALE, getLanguageCode } from '@/lib/locales';
import { repositoryName } from '@/prismicio';

import './globals.css';

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get the language code from middleware headers
  const headersList = await headers();
  const langCode =
    headersList.get('x-lang-code') || getLanguageCode(DEFAULT_LOCALE);
  const locale = headersList.get('x-locale') || DEFAULT_LOCALE;

  // Fetch navbar data
  const navbarData = await getNavbarData(locale);

  // Fetch footer data
  const footerData = await getFooterData(locale);

  // Fetch cookie banner data
  const cookieBannerData = await getCookieBannerData(locale);

  return (
    <html
      lang={langCode}
      className={bricolageGrotesque.className}
      suppressHydrationWarning
    >
      <head>
        <GoogleTagManager gtmId="GTM-P4MKQVT3" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>
            <CookieBannerProvider>
              <CookieBannerInitializer />
              {navbarData && <Navbar prismicData={navbarData} />}
              <main>
                {cookieBannerData && (
                  <CookieBanner prismicData={cookieBannerData} />
                )}
                {children}
              </main>
              {footerData && <Footer prismicData={footerData} />}
            </CookieBannerProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
      <PrismicPreview repositoryName={repositoryName} />
    </html>
  );
}
