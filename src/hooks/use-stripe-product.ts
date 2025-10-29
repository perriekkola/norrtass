import { useEffect, useState } from 'react';

interface StripeProduct {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  metadata: Record<string, string>;
}

interface StripePrice {
  id: string;
  amount: number | null;
  currency: string;
  formatted: string;
}

interface ProductData {
  product: StripeProduct;
  price: StripePrice;
}

interface UseStripeProductReturn {
  data: ProductData | null;
  loading: boolean;
  error: string | null;
}

export function useStripeProduct(
  productId: string | null,
  locale?: string
): UseStripeProductReturn {
  const [data, setData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = new URL(
          `/api/stripe/product/${productId}`,
          window.location.origin
        );
        if (locale) {
          url.searchParams.set('locale', locale);
        }
        const response = await fetch(url.toString());

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch product');
        }

        const productData = await response.json();
        setData(productData);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, locale]);

  return { data, loading, error };
}
