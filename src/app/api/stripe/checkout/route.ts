import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle both single item and multiple items
    let items: Array<{
      productId: string;
      priceId: string;
      quantity: number;
      metadata?: Record<string, string>;
    }> = [];

    if (body.items) {
      // Multiple items from cart
      items = body.items;
    } else {
      // Single item (backward compatibility)
      const { productId, priceId, quantity = 1, metadata = {} } = body;
      if (!productId || !priceId) {
        return NextResponse.json(
          { error: 'Product ID and Price ID are required' },
          { status: 400 }
        );
      }
      items = [{ productId, priceId, quantity, metadata }];
    }

    if (items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    // Get the origin for success/cancel URLs
    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000';

    const cancelUrl =
      typeof body.cancelUrl === 'string' && body.cancelUrl.length > 0
        ? body.cancelUrl
        : `${origin}?canceled=true`;

    // Create line items for Stripe
    const lineItems = await Promise.all(
      items.map(async ({ productId, priceId, quantity, metadata = {} }) => {
        // Get the price to access the product name
        const price = await stripe.prices.retrieve(priceId, {
          expand: ['product'],
        });

        // Type assertion for expanded product
        const product = price.product as Stripe.Product;

        // Create product name with size if provided
        const productName = metadata.size
          ? `${product.name} - Size ${metadata.size}`
          : product.name;

        return {
          price_data: {
            currency: price.currency,
            unit_amount: price.unit_amount || 0,
            product_data: {
              name: productName,
              description: product.description || undefined,
              images: product.images || [],
              metadata: {
                original_product_id: productId,
                size: metadata.size || '',
              },
            },
          },
          quantity: quantity,
        };
      })
    );

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        items_count: items.length.toString(),
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
