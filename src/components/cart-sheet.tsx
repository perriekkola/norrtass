'use client';

import React, { useState } from 'react';
import { isFilled } from '@prismicio/client';
import { PrismicNextImage } from '@prismicio/next';
import { ArrowRight, ShoppingCart, Trash2 } from 'lucide-react';

import { CustomRichText } from '@/components/custom-rich-text';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { QuantityPicker } from '@/components/ui/quantity-picker';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useCart } from '@/contexts/cart-context';
import { formatPrice } from '@/lib/utils';

import type { KeyTextField, RichTextField } from '@prismicio/client';

interface CartSheetProps {
  children: React.ReactNode;
  className?: string;
  cartTitle?: KeyTextField;
  checkoutButtonLabel?: KeyTextField;
  clearButtonLabel?: KeyTextField;
  totalLabel?: KeyTextField;
  cartDisclaimer?: RichTextField;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  locale?: string;
}

export function CartSheet({
  children,
  className,
  cartTitle,
  checkoutButtonLabel,
  clearButtonLabel,
  totalLabel,
  cartDisclaimer,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  locale,
}: CartSheetProps) {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getFormattedTotal,
    getTotalItems,
  } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  // Get current locale from props or default to 'en-us'
  const currentLocale = locale || 'en-us';

  // Use external control if provided, otherwise use internal state
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = externalOnOpenChange || setInternalOpen;

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setIsCheckingOut(true);
    try {
      // Create checkout session with all cart items
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            priceId: item.priceId,
            quantity: item.quantity,
            metadata: {
              size: item.size || '',
              ...item.metadata,
            },
          })),
          cancelUrl: window.location.href,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      // You might want to show a toast notification here
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild className={className}>
        {children}
      </SheetTrigger>
      <SheetContent className="flex w-full max-w-[85vw] flex-col gap-0 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="text-muted-foreground h-5 w-5" />
            <p className="text-xl">
              {isFilled.keyText(cartTitle) ? cartTitle : 'Cart'} (
              {getTotalItems()})
            </p>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Review and manage items in your shopping cart
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <ShoppingCart className="text-muted-foreground h-12 w-12" />
              <div>
                <p className="font-medium">Your cart is empty</p>
                <p className="text-muted-foreground text-sm">
                  Add some products to get started
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 space-y-2">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.size || ''}`}
                    className="flex gap-3 rounded-(--card-radius) border p-2"
                  >
                    {/* Product Image */}
                    {item.image && (
                      <div className="relative aspect-square h-[74px] flex-shrink-0 overflow-hidden rounded-md">
                        <PrismicNextImage
                          field={item.image}
                          fill
                          className="object-cover"
                          sizes="120px"
                        />
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="line-clamp-1 leading-none font-(--bold-text)">
                            {item.name}
                          </p>
                          {item.size && (
                            <p className="text-muted-foreground mt-0.5 text-xs md:text-sm">
                              {item.size}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="translate-x-1 -translate-y-1"
                          onClick={() => removeItem(item.id, item.size)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-end justify-between">
                        <QuantityPicker
                          value={item.quantity}
                          onChange={(quantity) =>
                            updateQuantity(item.id, quantity, item.size)
                          }
                          min={1}
                          max={99}
                          className="h-8 w-26"
                        />
                        <div className="font-(--bold-text)">
                          {formatPrice(
                            item.price * item.quantity,
                            item.currency,
                            currentLocale
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Cart Footer - Only show when items exist */}
        {items.length > 0 && (
          <SheetFooter className="flex-col space-y-2">
            {isFilled.richText(cartDisclaimer) && (
              <div className="bg-muted flex flex-col gap-2 rounded-(--card-radius) border p-2.5">
                <CustomRichText
                  className="prose-sm prose-headings:!mb-1.5 prose-h3:!text-lg prose-h4:!text-base"
                  field={cartDisclaimer}
                />
              </div>
            )}

            {/* Total */}
            <div className="text-muted-foreground flex items-center justify-between text-xl">
              <span>{isFilled.keyText(totalLabel) ? totalLabel : 'Total'}</span>
              <span className="text-foreground font-(--bold-text)">
                {getFormattedTotal(currentLocale)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex w-full flex-col space-y-2">
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={isCheckingOut || items.length === 0}
              >
                {isCheckingOut ? (
                  <LoadingSpinner className="text-foreground" />
                ) : (
                  <>
                    {isFilled.keyText(checkoutButtonLabel)
                      ? checkoutButtonLabel
                      : 'Checkout'}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={clearCart}
                disabled={items.length === 0}
              >
                {isFilled.keyText(clearButtonLabel)
                  ? clearButtonLabel
                  : 'Clear Cart'}
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
