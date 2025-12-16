'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart, formatPrice } from '@/lib/cart';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui';
import Image from 'next/image';
import Link from 'next/link';
import { redirectToCheckout } from '@/lib/stripe-client';
import { useTranslations } from 'next-intl';

export default function CheckoutPage() {
    const t = useTranslations();
    const router = useRouter();
    const { items, getSubtotal, isLoading: cartLoading } = useCart();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const subtotal = getSubtotal();

    // Handle checkout - create Stripe session and redirect
    const handleCheckout = async () => {
        if (items.length === 0) return;

        setIsCheckingOut(true);
        setError(null);

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: items.map((item) => ({
                        productId: item.id,
                        productTitle: item.title,
                        productSlug: item.slug,
                        price: item.price,
                        quantity: item.quantity,
                        imageUrl: item.imageUrl,
                    })),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session');
            }

            // Redirect to Stripe Checkout
            if (data.url) {
                redirectToCheckout(data.url);
            } else {
                throw new Error('No checkout URL received');
            }
        } catch (err) {
            console.error('Checkout error:', err);
            setError(err instanceof Error ? err.message : t('checkout.checkoutError'));
            setIsCheckingOut(false);
        }
    };

    if (cartLoading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-background pt-8 pb-16">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-center py-24">
                            <div className="animate-pulse flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-muted"></div>
                                <div className="h-4 w-32 bg-muted rounded"></div>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // Redirect to cart if empty
    if (items.length === 0) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-background pt-8 pb-16">
                    <div className="container mx-auto px-4 max-w-3xl text-center py-16">
                        <h1 className="font-display italic font-semibold text-3xl text-foreground mb-4">
                            {t('checkout.emptyCart')}
                        </h1>
                        <p className="text-muted mb-8">
                            {t('checkout.noItemsMessage')}
                        </p>
                        <Link href="/shop">
                            <Button variant="primary" size="lg">
                                {t('checkout.backToShop')}
                            </Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="min-h-screen bg-background pt-8 pb-16">
                <div className="container mx-auto px-4 max-w-5xl">
                    {/* Page Title */}
                    <div className="mb-8">
                        <Link href="/cart" className="text-muted hover:text-primary transition-colors text-sm mb-2 inline-flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            {t('checkout.backToCart')}
                        </Link>
                        <h1 className="font-display italic font-semibold text-4xl md:text-5xl text-foreground">
                            {t('checkout.title')}
                        </h1>
                        <p className="text-muted mt-2 font-body">
                            {t('checkout.reviewOrder')}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Order Items */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg border border-border p-6">
                                <h2 className="font-display italic text-xl text-foreground mb-6">
                                    {t('checkout.orderSummary')}
                                </h2>

                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex gap-4 pb-4 border-b border-border last:border-b-0 last:pb-0"
                                        >
                                            {/* Product Image */}
                                            <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-background-alt">
                                                {item.imageUrl ? (
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.title}
                                                        fill
                                                        className="object-cover"
                                                        sizes="80px"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted">
                                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={1.5}
                                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1">
                                                <h3 className="font-body text-foreground font-medium">
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm text-muted mt-1">
                                                    {t('checkout.quantity')}: {item.quantity}
                                                </p>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right">
                                                <span className="font-display text-lg text-primary font-semibold">
                                                    {formatPrice(item.price * item.quantity)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Shipping Info */}
                            <div className="bg-background-alt rounded-lg border border-border p-6 mt-6">
                                <h2 className="font-display italic text-xl text-foreground mb-4">
                                    {t('checkout.shippingInfo')}
                                </h2>
                                <div className="text-sm text-muted space-y-2 font-body">
                                    <p>
                                        {t('checkout.shippingDetails')}
                                    </p>
                                    <p>
                                        {t('checkout.specialShipping')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-background-alt rounded-lg border border-border p-6 sticky top-24">
                                <h2 className="font-display italic text-xl text-foreground mb-6">
                                    {t('checkout.total')}
                                </h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between font-body">
                                        <span className="text-muted">{t('checkout.subtotal')}</span>
                                        <span className="text-foreground font-medium">{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between font-body text-sm">
                                        <span className="text-muted">{t('checkout.shipping')}</span>
                                        <span className="text-muted italic">{t('checkout.toBeCalculated')}</span>
                                    </div>
                                    <div className="flex justify-between font-body text-sm">
                                        <span className="text-muted">{t('checkout.vat')}</span>
                                        <span className="text-muted italic">{t('checkout.included')}</span>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-4 mb-6">
                                    <div className="flex justify-between font-body">
                                        <span className="text-foreground font-medium">{t('checkout.orderTotal')}</span>
                                        <span className="font-display text-2xl text-primary font-semibold">
                                            {formatPrice(subtotal)}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="w-full"
                                    onClick={handleCheckout}
                                    disabled={isCheckingOut}
                                >
                                    {isCheckingOut ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {t('checkout.processing')}
                                        </span>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            {t('checkout.payWithStripe')}
                                        </>
                                    )}
                                </Button>

                                {/* Trust Badges */}
                                <div className="mt-6 pt-6 border-t border-border">
                                    <div className="flex items-center gap-2 text-muted text-sm font-body mb-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        <span>{t('checkout.trustBadges.securePayment')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted text-sm font-body mb-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                        <span>{t('checkout.trustBadges.cardTypes')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted text-sm font-body">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>{t('checkout.trustBadges.shipping')}</span>
                                    </div>
                                </div>

                                {/* Stripe Badge */}
                                <div className="mt-6 text-center">
                                    <p className="text-xs text-muted">{t('checkout.poweredByStripe')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
