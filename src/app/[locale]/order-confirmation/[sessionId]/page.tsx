'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { useTranslations } from 'next-intl';

interface OrderDetails {
    orderNumber?: string;
    customerEmail?: string;
    total?: number;
    currency?: string;
}

export default function OrderConfirmationPage() {
    const t = useTranslations();
    const params = useParams();
    const sessionId = params.sessionId as string;
    const { clearCart, isLoading: isCartLoading } = useCart();
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);

    // Track if we've already cleared the cart to prevent duplicate clears
    const hasCleared = useRef(false);

    // Clear cart on successful order - wait for cart to finish loading first
    useEffect(() => {
        // Only clear cart once the cart has finished loading from localStorage
        // This prevents the race condition where clearCart runs before the cart is loaded
        if (!isCartLoading && !hasCleared.current) {
            hasCleared.current = true;
            clearCart();
        }

        // In a real implementation, you would fetch order details from your backend
        // For now, we'll show a generic success message
        setLoading(false);
        setOrderDetails({
            orderNumber: sessionId?.slice(-8).toUpperCase(),
        });
    }, [sessionId, clearCart, isCartLoading]);

    if (loading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-background pt-8 pb-16">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-center py-24">
                            <div className="animate-pulse flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-muted"></div>
                                <div className="h-4 w-48 bg-muted rounded"></div>
                            </div>
                        </div>
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
                <div className="container mx-auto px-4 max-w-2xl">
                    {/* Success Icon */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                            <svg
                                className="w-10 h-10 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>

                        <h1 className="font-display italic font-semibold text-3xl md:text-4xl text-foreground mb-4">
                            {t('orderConfirmation.title')}
                        </h1>

                        <p className="text-muted font-body text-lg">
                            {t('orderConfirmation.thankYou')}
                        </p>
                    </div>

                    {/* Order Info Card */}
                    <div className="bg-white rounded-lg border border-border p-6 mb-8">
                        {orderDetails?.orderNumber && (
                            <div className="text-center mb-6 pb-6 border-b border-border">
                                <p className="text-sm text-muted mb-1">{t('orderConfirmation.orderNumber')}</p>
                                <p className="font-display text-2xl text-primary font-semibold">
                                    #{orderDetails.orderNumber}
                                </p>
                            </div>
                        )}

                        <div className="space-y-4 text-center">
                            <div className="flex items-start gap-3 text-left p-4 bg-background-alt rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <svg
                                        className="w-5 h-5 text-primary"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-medium text-foreground">{t('orderConfirmation.confirmationEmail.title')}</h3>
                                    <p className="text-sm text-muted mt-1">
                                        {t('orderConfirmation.confirmationEmail.description')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 text-left p-4 bg-background-alt rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <svg
                                        className="w-5 h-5 text-primary"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-medium text-foreground">{t('orderConfirmation.deliveryTime.title')}</h3>
                                    <p className="text-sm text-muted mt-1">
                                        {t('orderConfirmation.deliveryTime.description')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 text-left p-4 bg-background-alt rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <svg
                                        className="w-5 h-5 text-primary"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-medium text-foreground">{t('orderConfirmation.questions.title')}</h3>
                                    <p className="text-sm text-muted mt-1">
                                        {t('orderConfirmation.questions.description')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/shop">
                            <Button variant="primary" size="lg">
                                {t('orderConfirmation.continueShopping')}
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button variant="secondary" size="lg">
                                {t('orderConfirmation.contactUs')}
                            </Button>
                        </Link>
                    </div>

                    {/* Additional Message */}
                    <div className="mt-12 text-center">
                        <p className="text-sm text-muted font-body">
                            <span className="font-script text-lg text-primary">{t('orderConfirmation.thankYouMessage')}</span>
                            <br />
                            {t('orderConfirmation.appreciateYourTrust')}
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
