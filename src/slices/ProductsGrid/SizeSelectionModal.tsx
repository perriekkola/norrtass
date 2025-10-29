import { FC, useState } from 'react';
import { Content, ImageField, isFilled } from '@prismicio/client';
import { PrismicNextImage } from '@prismicio/next';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { QuantityPicker } from '@/components/ui/quantity-picker';
import { useCart } from '@/contexts/cart-context';
import { formatPrice } from '@/lib/utils';

interface SizeSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Content.PageDocument;
  stripeProduct: {
    product: { id: string; name: string };
    price: {
      id: string;
      amount: number | null; // Now in actual currency units, not cents
      currency: string;
      formatted: string;
    };
  } | null;
  sizes: Content.PageDocumentDataSizesItem[];
  featuredImage?: ImageField;
  ctaButtonLabel?: string;
  isLoading?: boolean;
  locale?: string;
}

export const SizeSelectionModal: FC<SizeSelectionModalProps> = ({
  open,
  onOpenChange,
  product,
  stripeProduct,
  sizes,
  featuredImage,
  ctaButtonLabel = 'Add to Cart',
  isLoading = false,
  locale,
}) => {
  const { addItem, openCart } = useCart();
  const [sizeQuantities, setSizeQuantities] = useState<Record<string, number>>(
    {}
  );

  // Get current locale from props or default to 'en-us'
  const currentLocale = locale || 'en-us';

  // Initialize size quantities when modal opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && Array.isArray(sizes) && sizes.length > 0) {
      // Initialize with 0 quantity for each size
      const initialQuantities: Record<string, number> = {};
      sizes.forEach((sizeItem: Content.PageDocumentDataSizesItem) => {
        if (sizeItem.size && !sizeItem.disabled) {
          initialQuantities[sizeItem.size] = 0;
        }
      });
      setSizeQuantities(initialQuantities);
    }
    onOpenChange(newOpen);
  };

  const updateSizeQuantity = (size: string, quantity: number) => {
    setSizeQuantities((prev) => ({
      ...prev,
      [size]: quantity,
    }));
  };

  const getTotalQuantity = () => {
    return Object.values(sizeQuantities).reduce(
      (total, quantity) => total + quantity,
      0
    );
  };

  const totalQuantity = getTotalQuantity();

  const handleAddToCart = () => {
    if (!stripeProduct || getTotalQuantity() === 0) return;

    // Add each size with its quantity to cart
    Object.entries(sizeQuantities).forEach(([size, quantity]) => {
      if (quantity > 0) {
        addItem({
          id: stripeProduct.product.id,
          name: stripeProduct.product.name,
          price: stripeProduct.price.amount || 0, // Use actual currency units, no cents
          currency: stripeProduct.price.currency,
          priceId: stripeProduct.price.id,
          quantity: quantity,
          size: size,
          image: featuredImage,
          metadata: {
            source: 'products_grid',
          },
        });
      }
    });

    // Close modal and open cart
    handleOpenChange(false);
    openCart();
  };

  const hasValidSizes =
    Array.isArray(sizes) &&
    sizes.length > 0 &&
    sizes.some((size: Content.PageDocumentDataSizesItem) => !size.disabled);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {isFilled.image(featuredImage) && (
              <div className="relative aspect-square h-12 w-12 overflow-hidden rounded-md">
                <PrismicNextImage
                  field={featuredImage}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
            )}
            <div className="flex-1 text-left">
              <h3 className="text-lg font-semibold">
                {product.data.page_title || 'Product'}
              </h3>
              {stripeProduct && (
                <p className="text-muted-foreground text-sm">
                  {stripeProduct.price.formatted}
                </p>
              )}
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Select quantities for each available size
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {hasValidSizes ? (
            <div className="space-y-2">
              {Array.isArray(sizes) &&
                sizes.map(
                  (
                    sizeItem: Content.PageDocumentDataSizesItem,
                    index: number
                  ) => {
                    if (!sizeItem.size || sizeItem.disabled) return null;

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-(--card-radius) border p-2"
                      >
                        <div className="ml-1 flex items-center gap-3">
                          <span className="font-medium">{sizeItem.size}</span>
                          {sizeQuantities[sizeItem.size] > 0 &&
                            stripeProduct && (
                              <span className="text-muted-foreground text-sm">
                                {formatPrice(
                                  (stripeProduct.price.amount || 0) *
                                    sizeQuantities[sizeItem.size],
                                  stripeProduct.price.currency,
                                  currentLocale
                                )}
                              </span>
                            )}
                        </div>
                        <QuantityPicker
                          value={sizeQuantities[sizeItem.size] || 0}
                          onChange={(quantity) =>
                            updateSizeQuantity(sizeItem.size!, quantity)
                          }
                          className="h-8 w-26"
                          min={0}
                          max={99}
                        />
                      </div>
                    );
                  }
                )}
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-muted-foreground">
                No sizes available for this product
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            className="w-full"
            size="lg"
            onClick={handleAddToCart}
            disabled={isLoading || !stripeProduct || totalQuantity === 0}
          >
            {isLoading ? (
              <LoadingSpinner className="size-4" />
            ) : (
              <Plus className="size-4" />
            )}
            {ctaButtonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
