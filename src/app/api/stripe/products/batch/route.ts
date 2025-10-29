import { unstable_cache } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

import { stripe } from '@/lib/stripe';

const getCachedProduct = unstable_cache(
  async (productId: string) => {
    const product = await stripe.products.retrieve(productId);
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
    });
    return { product, prices };
  },
  ['stripe-product-batch'],
  {
    revalidate: 300, // 5 minutes
    tags: ['stripe-products'],
  }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productIds, locale = 'en-US' } = body;

    if (!Array.isArray(productIds)) {
      return NextResponse.json(
        { error: 'productIds must be an array' },
        { status: 400 }
      );
    }

    if (productIds.length === 0) {
      return NextResponse.json({ products: [] });
    }

    // Convert locale format (sv-se -> sv-SE, en-us -> en-US)
    const localeCode = locale
      .split('-')
      .map((part: string, index: number) =>
        index === 0 ? part.toLowerCase() : part.toUpperCase()
      )
      .join('-');

    // Fetch all products in parallel using Promise.allSettled to handle failures gracefully
    const results = await Promise.allSettled(
      productIds.map(async (productId: string) => {
        const { product, prices } = await getCachedProduct(productId);
        const defaultPrice = prices.data[0];

        if (!defaultPrice) {
          throw new Error(`No active prices found for product ${productId}`);
        }

        return {
          productId,
          product: {
            id: product.id,
            name: product.name,
            description: product.description,
            images: product.images,
            metadata: product.metadata,
          },
          price: {
            id: defaultPrice.id,
            amount: (defaultPrice.unit_amount || 0) / 100, // Convert cents to actual currency units
            currency: defaultPrice.currency,
            formatted: new Intl.NumberFormat(localeCode, {
              style: 'currency',
              currency: defaultPrice.currency,
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format((defaultPrice.unit_amount || 0) / 100),
          },
        };
      })
    );

    // Separate successful and failed results
    const products: Array<{
      productId: string;
      product: {
        id: string;
        name: string;
        description: string | null;
        images: string[];
        metadata: Record<string, string>;
      };
      price: {
        id: string;
        amount: number;
        currency: string;
        formatted: string;
      };
    }> = [];
    const errors: { productId: string; error: string }[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        products.push(result.value);
      } else {
        errors.push({
          productId: productIds[index],
          error: result.reason?.message || 'Unknown error',
        });
      }
    });

    return NextResponse.json({
      products,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error in batch product fetch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
