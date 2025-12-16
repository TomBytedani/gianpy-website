import Stripe from 'stripe';

// Server-side Stripe instance (lazy initialization)
// This should only be used in server-side code (API routes, Server Components, etc.)
let stripeInstance: Stripe | null = null;

export function getStripeServer(): Stripe {
    if (!stripeInstance) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('Missing STRIPE_SECRET_KEY environment variable');
        }

        stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-11-17.clover',
            typescript: true,
        });
    }

    return stripeInstance;
}

// Stripe configuration for the Bottega del Restauro e-commerce
export const STRIPE_CONFIG = {
    // Currency for Italy/Europe
    currency: 'eur' as const,

    // Payment method types to accept
    paymentMethodTypes: ['card'] as const,

    // Shipping countries (Italy and EU)
    shippingCountries: [
        'IT', // Italy (primary)
        'FR', // France
        'DE', // Germany
        'AT', // Austria
        'CH', // Switzerland
        'ES', // Spain
        'BE', // Belgium
        'NL', // Netherlands
        'LU', // Luxembourg
        'PT', // Portugal
    ] as const,

    // Mode: 'payment' for one-time purchases
    mode: 'payment' as const,

    // Success and cancel URLs (relative, will be prefixed with base URL)
    successUrl: '/order-confirmation/{CHECKOUT_SESSION_ID}',
    cancelUrl: '/cart',
};

// Type for line items in checkout
export interface CheckoutLineItem {
    productId: string;
    productTitle: string;
    productSlug: string;
    price: number;
    quantity: number;
    imageUrl?: string;
}

// Create a checkout session for the given line items
export async function createCheckoutSession(
    lineItems: CheckoutLineItem[],
    userId?: string,
    customerEmail?: string,
): Promise<Stripe.Checkout.Session> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const session = await getStripeServer().checkout.sessions.create({
        mode: STRIPE_CONFIG.mode,
        payment_method_types: [...STRIPE_CONFIG.paymentMethodTypes],

        // Customer info
        customer_email: customerEmail,

        // Line items for products
        line_items: lineItems.map((item) => ({
            price_data: {
                currency: STRIPE_CONFIG.currency,
                product_data: {
                    name: item.productTitle,
                    images: item.imageUrl ? [`${baseUrl}${item.imageUrl}`] : undefined,
                    metadata: {
                        productId: item.productId,
                        productSlug: item.productSlug,
                    },
                },
                unit_amount: Math.round(item.price * 100), // Convert to cents
            },
            quantity: item.quantity,
        })),

        // Shipping address collection
        shipping_address_collection: {
            allowed_countries: [...STRIPE_CONFIG.shippingCountries],
        },

        // Phone number collection
        phone_number_collection: {
            enabled: true,
        },

        // Billing address required
        billing_address_collection: 'required',

        // URLs
        success_url: `${baseUrl}${STRIPE_CONFIG.successUrl}`,
        cancel_url: `${baseUrl}${STRIPE_CONFIG.cancelUrl}`,

        // Metadata for order tracking
        metadata: {
            userId: userId || 'guest',
            productIds: lineItems.map((item) => item.productId).join(','),
        },

        // Custom branding
        custom_text: {
            submit: {
                message: 'Bottega del Restauro processerà il tuo ordine entro 24 ore.',
            },
        },
    });

    return session;
}

// Retrieve a checkout session by ID
export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return getStripeServer().checkout.sessions.retrieve(sessionId, {
        expand: ['line_items', 'payment_intent', 'customer'],
    });
}

// Construct event from webhook payload
export function constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
): Stripe.Event {
    return getStripeServer().webhooks.constructEvent(payload, signature, webhookSecret);
}

// Format amount from cents to euros for display
export function formatStripeAmount(amountInCents: number): string {
    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR',
    }).format(amountInCents / 100);
}
