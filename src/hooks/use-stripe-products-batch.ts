import { useEffect, useRef, useState } from 'react';

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
  productId: string;
  product: StripeProduct;
  price: StripePrice;
}

interface BatchResponse {
  products: ProductData[];
  errors?: { productId: string; error: string }[];
}

interface UseStripeProductsBatchReturn {
  data: Record<string, ProductData>;
  loading: boolean;
  errors: Record<string, string>;
  refetch: () => void;
}

export function useStripeProductsBatch(
  productIds: string[],
  locale?: string
): UseStripeProductsBatchReturn {
  const [data, setData] = useState<Record<string, ProductData>>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const abortControllerRef = useRef<AbortController | null>(null);
  const previousProductIdsRef = useRef<string>('');

  const fetchProducts = async () => {
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (productIds.length === 0) {
      setData({});
      setErrors({});
      setLoading(false);
      return;
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/stripe/products/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds,
          locale,
        }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch products');
      }

      const batchResponse: BatchResponse = await response.json();

      // Convert array to object keyed by productId
      const productsMap: Record<string, ProductData> = {};
      batchResponse.products.forEach((product) => {
        productsMap[product.productId] = product;
      });

      // Convert errors array to object keyed by productId
      const errorsMap: Record<string, string> = {};
      if (batchResponse.errors) {
        batchResponse.errors.forEach((error) => {
          errorsMap[error.productId] = error.error;
        });
      }

      setData(productsMap);
      setErrors(errorsMap);
    } catch (err) {
      // Don't set error state if the request was aborted
      if (!signal.aborted) {
        console.error('Error fetching products batch:', err);
        const errorMap: Record<string, string> = {};
        productIds.forEach((id) => {
          errorMap[id] = err instanceof Error ? err.message : 'Unknown error';
        });
        setErrors(errorMap);
        setData({});
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Create a string representation of productIds for comparison
    const currentProductIds = JSON.stringify(productIds.sort());

    // Only fetch if productIds have actually changed
    if (currentProductIds !== previousProductIdsRef.current) {
      previousProductIdsRef.current = currentProductIds;
      fetchProducts();
    }

    // Cleanup function to cancel ongoing requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [JSON.stringify(productIds.sort()), locale]);

  const refetch = () => {
    fetchProducts();
  };

  return { data, loading, errors, refetch };
}
