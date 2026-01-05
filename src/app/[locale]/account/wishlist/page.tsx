'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCart } from '@/lib/cart';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui';

interface WishlistProduct {
    id: string;
    title: string;
    titleEn: string | null;
    slug: string;
    price: number;
    status: string;
    categoryName: string | null;
    categoryNameEn: string | null;
    imageUrl: string | null;
}

interface WishlistItem {
    id: string;
    productId: string;
    createdAt: string;
    notifyOnSale: boolean;
    notifyOnPriceChange: boolean;
    product: WishlistProduct;
}

// Format price helper
function formatPrice(price: number): string {
    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR',
    }).format(price);
}

export default function WishlistPage() {
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const t = useTranslations('account');
    const tCommon = useTranslations('common');
    const { addItem, isInCart } = useCart();

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const response = await fetch('/api/wishlist');
            if (response.ok) {
                const data = await response.json();
                setWishlistItems(data.items || []);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const removeFromWishlist = async (productId: string) => {
        setRemovingId(productId);
        try {
            const response = await fetch(`/api/wishlist/${productId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setWishlistItems(items => items.filter(item => item.productId !== productId));
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        } finally {
            setRemovingId(null);
        }
    };

    const handleAddToCart = (item: WishlistItem) => {
        addItem({
            id: item.product.id,
            title: item.product.title,
            titleEn: item.product.titleEn || undefined,
            slug: item.product.slug,
            price: item.product.price,
            imageUrl: item.product.imageUrl || undefined,
            status: item.product.status as 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'COMING_SOON',
        });
    };

    // Status badges will use translation keys inline

    if (isLoading) {
        return (
            <div>
                <div className="mb-8">
                    <div className="h-10 w-64 bg-muted/20 animate-pulse rounded"></div>
                    <div className="h-4 w-48 bg-muted/20 animate-pulse rounded mt-2"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white rounded-lg border border-border p-4 animate-pulse">
                            <div className="aspect-square bg-muted/20 rounded-md mb-4"></div>
                            <div className="h-4 bg-muted/20 rounded w-3/4 mb-2"></div>
                            <div className="h-6 bg-muted/20 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="font-display italic font-semibold text-3xl md:text-4xl text-foreground">
                    {t('wishlist.title')}
                </h1>
                <p className="text-muted mt-2 font-body">
                    {t('wishlist.subtitle')} • {wishlistItems.length} {wishlistItems.length === 1 ? t('orders.items', { count: 1 }).split(' ')[1] : t('orders.items', { count: wishlistItems.length }).split(' ')[1]}
                </p>
            </div>

            {wishlistItems.length === 0 ? (
                /* Empty State */
                <div className="bg-white rounded-lg border border-border p-12 text-center shadow-sm">
                    <svg
                        className="w-20 h-20 mx-auto text-muted opacity-40 mb-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                    <h2 className="font-display italic text-2xl text-foreground mb-3">
                        {t('wishlist.empty')}
                    </h2>
                    <p className="text-muted font-body mb-6 max-w-md mx-auto">
                        {t('wishlist.emptyMessage')}
                    </p>
                    <Link href="/shop">
                        <Button variant="primary" size="lg">
                            {t('wishlist.browseCollection')}
                        </Button>
                    </Link>
                </div>
            ) : (
                /* Wishlist Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map((item) => {
                        const isSold = item.product.status === 'SOLD';
                        const inCart = isInCart(item.product.id);
                        const getStatusColor = (status: string) => {
                            const colors = {
                                AVAILABLE: { bg: 'bg-green-100', text: 'text-green-800' },
                                SOLD: { bg: 'bg-red-100', text: 'text-red-800' },
                                RESERVED: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
                                COMING_SOON: { bg: 'bg-blue-100', text: 'text-blue-800' },
                            };
                            return colors[status as keyof typeof colors] || colors.AVAILABLE;
                        };
                        const statusColor = getStatusColor(item.product.status);

                        return (
                            <div
                                key={item.id}
                                className="bg-white rounded-lg border border-border shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
                            >
                                {/* Product Image */}
                                <Link href={`/shop/${item.product.slug}`}>
                                    <div className="relative aspect-square bg-background-alt overflow-hidden">
                                        {item.product.imageUrl ? (
                                            <Image
                                                src={item.product.imageUrl}
                                                alt={item.product.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted">
                                                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}

                                        {/* Sold Overlay */}
                                        {isSold && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <span className="font-script text-3xl text-white">{t('wishlist.soldAlert')}</span>
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        {!isSold && (
                                            <div className="absolute top-3 left-3">
                                                <span className={`px-2 py-1 text-xs font-medium rounded ${statusColor.bg} ${statusColor.text}`}>
                                                    {tCommon(`status.${item.product.status.toLowerCase().replace('_', '')}`)}
                                                </span>
                                            </div>
                                        )}

                                        {/* Remove Button */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                removeFromWishlist(item.productId);
                                            }}
                                            disabled={removingId === item.productId}
                                            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors disabled:opacity-50"
                                            title={t('wishlist.removeItem')}
                                        >
                                            {removingId === item.productId ? (
                                                <svg className="w-5 h-5 text-muted animate-spin\" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </Link>

                                {/* Product Info */}
                                <div className="p-4">
                                    <Link href={`/shop/${item.product.slug}`}>
                                        <h3 className="font-display italic text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                                            {item.product.title}
                                        </h3>
                                    </Link>

                                    <div className="flex items-center justify-between mt-3">
                                        <span className="font-display text-xl text-primary font-semibold">
                                            {formatPrice(item.product.price)}
                                        </span>

                                        {!isSold && (
                                            <button
                                                onClick={() => handleAddToCart(item)}
                                                disabled={inCart}
                                                className={`
                                                    p-2 rounded-full transition-all
                                                    ${inCart
                                                        ? 'bg-green-100 text-green-600 cursor-default'
                                                        : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                                                    }
                                                `}
                                                title={inCart ? tCommon('buttons.goToCart') : t('wishlist.addToCart')}
                                            >
                                                {inCart ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                    </svg>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
