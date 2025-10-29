'use client';

import React, { useEffect, useState } from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicNextLink } from '@prismicio/next';
import { Menu, ShoppingCart } from 'lucide-react';
import SVG from 'react-inlinesvg';

import { CartSheet } from '@/components/cart-sheet';
import { CustomRichText } from '@/components/custom-rich-text';
import { LanguageSwitcher } from '@/components/language-switcher';
import { AnimatedBackground } from '@/components/motion-primitives/animated-background';
import { ProgressiveBlur } from '@/components/motion-primitives/progressive-blur';
import { CustomSVG } from '@/components/svg';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useCart } from '@/contexts/cart-context';
import { cn } from '@/lib/utils';

import {
  NavbarDocument,
  NavbarDocumentDataLinksItem,
  NavlinkDocumentDataSublinksItem,
} from '../../prismicio-types';

const Navbar = ({ prismicData }: { prismicData: NavbarDocument }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getTotalItems, isCartOpen, setIsCartOpen } = useCart();

  // Get current locale from navbar data or default to 'en-us'
  const currentLocale = prismicData.lang || 'en-us';

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    // Check initial scroll position on page load
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <section className="pointer-events-none sticky top-0 z-50 w-full">
      <ProgressiveBlur
        direction="top"
        blurLayers={5}
        blurIntensity={1.5}
        className={cn(
          'from-background/70 via-background/30 pointer-events-none absolute top-0 right-0 left-0 h-[96px] -translate-y-full bg-linear-to-b to-transparent transition-transform duration-500 lg:h-[120px]',
          isScrolled && 'translate-y-0'
        )}
      />
      <div className="pointer-events-auto container !pr-1 !pl-2 md:!px-(--container-padding-desktop)">
        <div className={cn('relative py-2 transition-all md:py-3.5')}>
          {/* Desktop Menu */}
          <nav className="hidden items-center justify-between lg:flex">
            {/* Logo - Left */}
            <div className="flex-shrink-0">
              {prismicData.data.logo && prismicData.data.logo.url && (
                <PrismicNextLink field={prismicData.data.logo_link}>
                  <CustomSVG
                    src={prismicData.data.logo.url}
                    className="h-[44px] w-auto text-pink-700 dark:text-pink-300"
                    title={prismicData.data.logo.alt}
                  />
                </PrismicNextLink>
              )}
            </div>

            {/* Navigation Menu - Absolutely Centered */}
            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <NavigationMenu viewport={false}>
                <NavigationMenuList>
                  <AnimatedBackground
                    enableHover={true}
                    className="bg-accent rounded-md"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    {renderNavigationItems(prismicData.data.links)}
                  </AnimatedBackground>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* CTA Buttons - Right */}
            <div className="flex-shrink-0">
              {prismicData.data.cta_link &&
                prismicData.data.cta_link.length > 0 && (
                  <div className="flex items-center gap-2">
                    <LanguageSwitcher />

                    {prismicData.data.cta_link.map((item) => (
                      <Button variant={item.variant} asChild key={item.text}>
                        <PrismicNextLink field={item}>
                          {item.text}
                        </PrismicNextLink>
                      </Button>
                    ))}

                    {/* Cart Button - Only show if items exist */}
                    {getTotalItems() > 0 && (
                      <CartSheet
                        cartTitle={prismicData.data.cart_title}
                        checkoutButtonLabel={
                          prismicData.data.checkout_button_label
                        }
                        clearButtonLabel={prismicData.data.clear_button_label}
                        totalLabel={prismicData.data.total_label}
                        cartDisclaimer={prismicData.data.cart_disclaimer}
                        locale={currentLocale}
                      >
                        <Button
                          variant="outline"
                          size="icon"
                          className="relative"
                        >
                          <ShoppingCart className="h-5 w-5" />
                          {getTotalItems() > 0 && (
                            <span className="bg-primary text-primary-foreground absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full px-1.5 text-xs font-(--bold-text)">
                              {getTotalItems() > 9 ? '9+' : getTotalItems()}
                            </span>
                          )}
                        </Button>
                      </CartSheet>
                    )}
                  </div>
                )}
            </div>
          </nav>

          {/* Mobile Menu */}
          <div className="block lg:hidden">
            <div className="flex items-center justify-between">
              {/* Logo */}
              {prismicData.data.logo && prismicData.data.logo.url && (
                <PrismicNextLink field={prismicData.data.logo_link}>
                  <CustomSVG
                    src={prismicData.data.logo.url}
                    className="h-[36px] w-auto text-pink-700 dark:text-pink-300"
                    title={prismicData.data.logo.alt}
                  />
                </PrismicNextLink>
              )}

              <div className="flex items-center gap-1.5">
                {isFilled.link(prismicData.data.mobile_cta_link) && (
                  <Button
                    variant={prismicData.data.mobile_cta_link.variant}
                    asChild
                    size="sm"
                  >
                    <PrismicNextLink field={prismicData.data.mobile_cta_link}>
                      {prismicData.data.mobile_cta_link.text}
                    </PrismicNextLink>
                  </Button>
                )}

                {/* Mobile Cart Button - Only show if items exist */}
                {getTotalItems() > 0 && (
                  <CartSheet
                    cartTitle={prismicData.data.cart_title}
                    checkoutButtonLabel={prismicData.data.checkout_button_label}
                    clearButtonLabel={prismicData.data.clear_button_label}
                    totalLabel={prismicData.data.total_label}
                    cartDisclaimer={prismicData.data.cart_disclaimer}
                    open={isCartOpen}
                    onOpenChange={setIsCartOpen}
                    locale={currentLocale}
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      className="relative h-9 w-9"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {getTotalItems() > 0 && (
                        <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-xs font-medium">
                          {getTotalItems() > 9 ? '9+' : getTotalItems()}
                        </span>
                      )}
                    </Button>
                  </CartSheet>
                )}

                <Sheet
                  open={isMobileMenuOpen}
                  onOpenChange={setIsMobileMenuOpen}
                >
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Open mobile menu"
                    >
                      <Menu className="size-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>
                        <span className="sr-only">Menu</span>
                        <LanguageSwitcher showText variant="outline" />
                      </SheetTitle>
                      <SheetDescription className="sr-only">
                        <span className="sr-only">Menu</span>
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex flex-col gap-6 p-4">
                      <Accordion
                        type="single"
                        collapsible
                        className="flex w-full flex-col gap-4"
                      >
                        {prismicData.data.links?.map((item) =>
                          renderMobileMenuItem(item, closeMobileMenu)
                        )}
                      </Accordion>

                      {prismicData.data.cta_link &&
                        prismicData.data.cta_link.length > 0 && (
                          <div className="flex flex-col gap-2">
                            {prismicData.data.cta_link.map((item) => (
                              <Button
                                variant={item.variant}
                                asChild
                                key={item.text}
                                onClick={closeMobileMenu}
                              >
                                <PrismicNextLink field={item}>
                                  {item.text}
                                </PrismicNextLink>
                              </Button>
                            ))}
                          </div>
                        )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const renderNavigationItems = (
  links: NavbarDocumentDataLinksItem[] | undefined
): React.ReactElement<{ 'data-id': string }>[] => {
  if (!links) return [];

  const navigationItems: React.ReactElement<{ 'data-id': string }>[] = [];

  links.forEach((item) => {
    if (isFilled.contentRelationship(item.link)) {
      if (item.link.data?.dropdown_label) {
        // Handle dropdown items with proper NavigationMenuItem structure
        const dropdownLabel = item.link.data?.dropdown_label;
        navigationItems.push(
          <NavigationMenuItem
            key={dropdownLabel}
            data-id={dropdownLabel}
            className="group inline-flex h-9 w-max items-center justify-center rounded-md py-2 text-sm font-medium transition-colors hover:bg-transparent"
          >
            <NavigationMenuTrigger className="hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:hover:bg-transparent">
              {dropdownLabel}
            </NavigationMenuTrigger>
            <NavigationMenuContent className="min-w-[280px]">
              <AnimatedBackground
                enableHover={true}
                className="bg-accent rounded-md"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {item.link.data?.sublinks.map(
                  (subItem: NavlinkDocumentDataSublinksItem) => (
                    <div
                      key={subItem.link.text}
                      data-id={subItem.link.text}
                      className="hover:bg-transparent"
                    >
                      <NavigationMenuLink asChild>
                        <SubMenuLink
                          item={subItem}
                          className="flex-row gap-3"
                        />
                      </NavigationMenuLink>
                    </div>
                  )
                )}
              </AnimatedBackground>
            </NavigationMenuContent>
          </NavigationMenuItem>
        );
      } else {
        // Handle simple links
        const linkText = item.link.data?.main_link?.text || '';
        navigationItems.push(
          <PrismicNextLink
            key={linkText}
            data-id={linkText}
            className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-transparent"
            field={item.link.data?.main_link}
          >
            {linkText}
          </PrismicNextLink>
        );
      }
    }
  });

  return navigationItems;
};

const renderMobileMenuItem = (
  item: NavbarDocumentDataLinksItem,
  closeMobileMenu: () => void
) => {
  if (isFilled.contentRelationship(item.link)) {
    if (item.link.data?.dropdown_label) {
      return (
        <AccordionItem
          key={item.link.data?.dropdown_label}
          value={item.link.data?.dropdown_label}
          className="border-b-0"
        >
          <AccordionTrigger className="text-md py-0 font-(--bold-text) hover:no-underline">
            {item.link.data?.dropdown_label}
          </AccordionTrigger>
          <AccordionContent className="mt-2">
            {item.link.data?.sublinks.map(
              (subItem: NavlinkDocumentDataSublinksItem) => (
                <SubMenuLink
                  key={subItem.link.text}
                  item={subItem}
                  onLinkClick={closeMobileMenu}
                />
              )
            )}
          </AccordionContent>
        </AccordionItem>
      );
    }

    return (
      <PrismicNextLink
        key={item.link.data?.main_link?.text}
        field={item.link.data?.main_link}
        className="text-md py-0 font-(--bold-text) hover:no-underline"
        onClick={closeMobileMenu}
      >
        {item.link.data?.main_link?.text}
      </PrismicNextLink>
    );
  }
};

const SubMenuLink = ({
  item,
  className,
  onLinkClick,
}: {
  item: NavlinkDocumentDataSublinksItem;
  className?: string;
  onLinkClick?: () => void;
}) => {
  return (
    <PrismicNextLink
      className={cn(
        'flex flex-row gap-2 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-transparent',
        className
      )}
      field={item.link}
      onClick={onLinkClick}
    >
      {item.icon && item.icon.url && (
        <SVG
          src={item.icon.url}
          className="size-4 shrink-0"
          title={item.icon.alt}
        />
      )}

      <div>
        <div className="text-sm font-(--bold-text)">{item.link.text}</div>
        {item.description && (
          <CustomRichText
            className="text-muted-foreground text-sm leading-snug"
            field={item.description}
          />
        )}
      </div>
    </PrismicNextLink>
  );
};

export { Navbar };
