import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, CheckoutLineItem } from '@/lib/stripe';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();
        const { items } = body as { items: CheckoutLineItem[] };

        // Validate items
        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: 'No items provided' },
                { status: 400 }
            );
        }

        // Validate each item has required fields
        for (const item of items) {
            if (!item.productId || !item.productTitle || typeof item.price !== 'number' || !item.quantity) {
                return NextResponse.json(
                    { error: 'Invalid item data' },
                    { status: 400 }
                );
            }
        }

        // Get user session if authenticated
        const session = await auth();
        const userId = session?.user?.id;
        const customerEmail = session?.user?.email || undefined;

        // Create Stripe checkout session
        const checkoutSession = await createCheckoutSession(
            items,
            userId,
            customerEmail
        );

        // Return session ID for client-side redirect
        return NextResponse.json({
            sessionId: checkoutSession.id,
            url: checkoutSession.url,
        });

    } catch (error) {
        console.error('Checkout error:', error);

        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
