'use client';

import { useState } from 'react';
import { useCart, formatPrice } from '@/lib/cart';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function CartPage() {
    const t = useTranslations();
    const locale = useLocale();
    const { items, removeItem, getSubtotal, isLoading, clearCart } = useCart();
    const {
        settings,
        calculateCartShipping,
        isFreeShipping,
        getShippingNotes,
        getCartShippingNotes,
        hasSpecialShippingItems
    } = useSiteSettings();
    const subtotal = getSubtotal();

    // Shipping destination state
    const [isInternational, setIsInternational] = useState(false);

    // Calculate shipping with product-level overrides and destination
    const shippingCost = calculateCartShipping(items, subtotal, isInternational);
    const hasFreeShipping = isFreeShipping(subtotal);
    const globalShippingNotes = getShippingNotes(locale);
    const productShippingNotes = getCartShippingNotes(items, locale);
    const hasSpecialItems = hasSpecialShippingItems(items);

    // Helper to get localized title
    const getLocalizedTitle = (item: typeof items[0]) => {
        return locale === 'en' && item.titleEn ? item.titleEn : item.title;
    };

    if (isLoading) {
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

    return (
        <>
            <Header />
            <main className="min-h-screen bg-background pt-8 pb-16">
                <div className="container mx-auto px-4 max-w-5xl">
                    {/* Page Title */}
                    <div className="mb-8">
                        <h1 className="font-display italic font-semibold text-4xl md:text-5xl text-foreground">
                            {t('cart.title')}
                        </h1>
                        <p className="text-muted mt-2 font-body">
                            {items.length === 0
                                ? t('cart.empty')
                                : t('cart.items', { count: items.length })}
                        </p>
                    </div>

                    {items.length === 0 ? (
                        /* Empty Cart State */
                        <div className="text-center py-16 bg-background-alt rounded-lg border border-border">
                            <div className="mb-6">
                                <svg
                                    className="w-24 h-24 mx-auto text-muted opacity-50"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                    />
                                </svg>
                            </div>
                            <h2 className="font-display italic text-2xl text-foreground mb-2">
                                {t('cart.empty')}
                            </h2>
                            <p className="text-muted mb-8 max-w-md mx-auto font-body">
                                {t('cart.emptyMessage')}
                            </p>
                            <Link href="/shop">
                                <Button variant="primary" size="lg">
                                    {t('cart.discoverCollection')}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        /* Cart with Items */
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Cart Items */}
                            <div className="lg:col-span-2 space-y-4">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-lg border border-border p-4 md:p-6 flex flex-col sm:flex-row gap-4 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        {/* Product Image */}
                                        <div className="relative w-full sm:w-32 h-32 sm:h-32 flex-shrink-0 rounded-md overflow-hidden bg-background-alt">
                                            {item.imageUrl ? (
                                                <Image
                                                    src={item.imageUrl}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 640px) 100vw, 128px"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted">
                                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <Link href={`/shop/${item.slug}`} className="block group">
                                                    <h3 className="font-display italic text-lg md:text-xl text-foreground group-hover:text-primary transition-colors">
                                                        {getLocalizedTitle(item)}
                                                    </h3>
                                                </Link>

                                                {/* Status Badge */}
                                                {item.status !== 'AVAILABLE' && (
                                                    <span className={`
                            inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded
                            ${item.status === 'SOLD' ? 'bg-red-100 text-red-700' : ''}
                            ${item.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-700' : ''}
                            ${item.status === 'COMING_SOON' ? 'bg-blue-100 text-blue-700' : ''}
                          `}>
                                                        {item.status === 'SOLD' && t('common.status.sold')}
                                                        {item.status === 'RESERVED' && t('common.status.reserved')}
                                                        {item.status === 'COMING_SOON' && t('common.status.comingSoon')}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                <span className="font-display text-xl text-primary font-semibold">
                                                    {formatPrice(item.price)}
                                                </span>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-muted hover:text-red-600 transition-colors flex items-center gap-1 text-sm font-body"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        />
                                                    </svg>
                                                    {t('common.buttons.removeFromCart')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Clear Cart Button */}
                                <div className="pt-4 border-t border-border">
                                    <button
                                        onClick={() => {
                                            if (confirm(t('cart.confirmClearCart'))) {
                                                clearCart();
                                            }
                                        }}
                                        className="text-muted hover:text-red-600 transition-colors text-sm font-body flex items-center gap-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </svg>
                                        {t('cart.clearCart')}
                                    </button>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="bg-background-alt rounded-lg border border-border p-6 sticky top-24">
                                    <h2 className="font-display italic text-xl text-foreground mb-6">
                                        {t('cart.orderSummary')}
                                    </h2>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between font-body">
                                            <span className="text-muted">{t('cart.subtotal')}</span>
                                            <span className="text-foreground font-medium">{formatPrice(subtotal)}</span>
                                        </div>

                                        {/* Shipping Destination Selector */}
                                        <div className="border-t border-b border-border py-3">
                                            <label className="block text-sm font-body text-muted mb-2">
                                                {locale === 'en' ? 'Shipping to:' : 'Spedizione verso:'}
                                            </label>
                                            <select
                                                value={isInternational ? 'international' : 'domestic'}
                                                onChange={(e) => setIsInternational(e.target.value === 'international')}
                                                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                            >
                                                <option value="domestic">
                                                    🇮🇹 {locale === 'en' ? 'Italy (Domestic)' : 'Italia (Nazionale)'}
                                                </option>
                                                <option value="international">
                                                    🌍 {locale === 'en' ? 'International' : 'Internazionale'}
                                                </option>
                                            </select>
                                        </div>

                                        <div className="flex justify-between font-body text-sm">
                                            <span className="text-muted">{t('cart.shipping')}</span>
                                            {hasFreeShipping ? (
                                                <span className="text-green-600 font-medium">{t('cart.freeShipping') || 'Free'}</span>
                                            ) : (
                                                <span className="text-foreground">{formatPrice(shippingCost)}</span>
                                            )}
                                        </div>
                                        {/* Free shipping threshold message */}
                                        {!hasFreeShipping && settings && (
                                            <div className="bg-primary/10 rounded-lg p-3 text-sm">
                                                <p className="text-foreground">
                                                    {locale === 'en'
                                                        ? `Add ${formatPrice(settings.freeShippingThreshold - subtotal)} more for free shipping!`
                                                        : `Aggiungi ${formatPrice(settings.freeShippingThreshold - subtotal)} per la spedizione gratuita!`
                                                    }
                                                </p>
                                            </div>
                                        )}
                                        {/* Special shipping warning */}
                                        {hasSpecialItems && (
                                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                                                <p className="text-amber-800 flex items-center gap-2">
                                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    {locale === 'en'
                                                        ? 'This order contains items requiring special handling'
                                                        : 'Questo ordine contiene articoli che richiedono una gestione speciale'
                                                    }
                                                </p>
                                            </div>
                                        )}
                                        {/* Product-specific shipping notes */}
                                        {productShippingNotes.length > 0 && (
                                            <div className="space-y-1">
                                                {productShippingNotes.map((note, index) => (
                                                    <p key={index} className="text-xs text-amber-700 italic">
                                                        ⚠ {note}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                        {/* Global shipping notes */}
                                        {globalShippingNotes && (
                                            <p className="text-xs text-muted italic">{globalShippingNotes}</p>
                                        )}
                                    </div>

                                    <div className="border-t border-border pt-4 mb-6">
                                        <div className="flex justify-between font-body">
                                            <span className="text-foreground font-medium">{t('cart.total')}</span>
                                            <span className="font-display text-2xl text-primary font-semibold">
                                                {formatPrice(subtotal + shippingCost)}
                                            </span>
                                        </div>
                                    </div>

                                    <Link href="/checkout" className="block">
                                        <Button variant="primary" size="lg" className="w-full">
                                            {t('common.buttons.proceedToCheckout')}
                                        </Button>
                                    </Link>

                                    <Link href="/shop" className="block mt-4">
                                        <Button variant="ghost" size="md" className="w-full">
                                            {t('common.buttons.continueShopping')}
                                        </Button>
                                    </Link>

                                    {/* Trust Badges */}
                                    <div className="mt-6 pt-6 border-t border-border">
                                        <div className="flex items-center gap-2 text-muted text-sm font-body mb-3">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                                />
                                            </svg>
                                            <span>{t('cart.trust.securePayment')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted text-sm font-body mb-3">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                                />
                                            </svg>
                                            <span>{t('cart.trust.paymentMethods')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted text-sm font-body">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <span>{t('cart.trust.shippingTime')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
