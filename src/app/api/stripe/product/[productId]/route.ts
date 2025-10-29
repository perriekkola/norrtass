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
  ['stripe-product'],
  {
    revalidate: 300, // 5 minutes
    tags: ['stripe-products'],
  }
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    // Get locale from query params, default to 'en-US'
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en-US';
    // Convert locale format (sv-se -> sv-SE, en-us -> en-US)
    const localeCode = locale
      .split('-')
      .map((part, index) =>
        index === 0 ? part.toLowerCase() : part.toUpperCase()
      )
      .join('-');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Fetch the product and prices from cache
    const { product, prices } = await getCachedProduct(productId);

    // Get the default price (usually the first active price)
    const defaultPrice = prices.data[0];

    if (!defaultPrice) {
      return NextResponse.json(
        { error: 'No active prices found for this product' },
        { status: 404 }
      );
    }

    return NextResponse.json({
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
          minimumFractionDigits: 0, // Ensure no decimal places are shown
          maximumFractionDigits: 0, // Ensure no decimal places are shown
        }).format((defaultPrice.unit_amount || 0) / 100),
      },
    });
  } catch (error) {
    console.error('Error fetching product:', error);

    if (error instanceof Error && error.message.includes('No such product')) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch product information' },
      { status: 500 }
    );
  }
}
