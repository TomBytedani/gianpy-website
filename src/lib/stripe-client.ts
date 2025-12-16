import { loadStripe, Stripe } from '@stripe/stripe-js';

// Client-side Stripe promise
// This loads Stripe.js asynchronously and caches it for reuse
let stripePromise: Promise<Stripe | null>;

export const getStripe = (): Promise<Stripe | null> => {
    if (!stripePromise) {
        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

        if (!publishableKey) {
            console.error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable');
            return Promise.resolve(null);
        }

        stripePromise = loadStripe(publishableKey);
    }

    return stripePromise;
};

// Redirect to Stripe Checkout using the checkout URL
// Note: Modern approach is to use the URL returned from checkout session creation
export async function redirectToCheckout(checkoutUrl: string): Promise<void> {
    if (!checkoutUrl) {
        throw new Error('No checkout URL provided');
    }

    // Redirect to Stripe Checkout page
    window.location.href = checkoutUrl;
}
