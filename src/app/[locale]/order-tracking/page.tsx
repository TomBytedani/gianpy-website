'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

interface OrderItem {
    id: string;
    productTitle: string;
    productSlug: string;
    price: number;
    quantity: number;
    imageUrl?: string;
}

interface TrackedOrder {
    id: string;
    orderNumber: string;
    status: string;
    subtotal: number;
    shippingCost: number;
    tax: number;
    total: number;
    shippingName: string | null;
    shippingAddress: string | null;
    shippingCity: string | null;
    shippingPostal: string | null;
    shippingCountry: string | null;
    createdAt: string;
    paidAt: string | null;
    shippedAt: string | null;
    items: OrderItem[];
}

const statusConfig: Record<string, { label: string; labelEn: string; color: string; icon: string }> = {
    PENDING: {
        label: 'In Attesa di Pagamento',
        labelEn: 'Awaiting Payment',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '⏳',
    },
    PAID: {
        label: 'Pagato - In Preparazione',
        labelEn: 'Paid - Processing',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: '✓',
    },
    SHIPPED: {
        label: 'Spedito',
        labelEn: 'Shipped',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: '🚚',
    },
    DELIVERED: {
        label: 'Consegnato',
        labelEn: 'Delivered',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: '📦',
    },
    CANCELLED: {
        label: 'Annullato',
        labelEn: 'Cancelled',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: '✕',
    },
};

export default function OrderTrackingPage() {
    const t = useTranslations('orderTracking');
    const [orderNumber, setOrderNumber] = useState('');
    const [email, setEmail] = useState('');
    const [order, setOrder] = useState<TrackedOrder | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setOrder(null);

        try {
            const response = await fetch('/api/orders/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderNumber, email }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to find order');
            }

            const data = await response.json();
            setOrder(data.order);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }

    function formatDate(date: string | null) {
        if (!date) return '-';
        return new Intl.DateTimeFormat('it-IT', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(date));
    }

    function formatPrice(price: number) {
        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: 'EUR',
        }).format(price);
    }

    const statusInfo = order ? statusConfig[order.status] || statusConfig.PENDING : null;

    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* Hero Section */}
            <section className="bg-[var(--surface)] border-b border-[var(--border)]">
                <div className="container mx-auto px-4 py-16 text-center">
                    <span className="text-sm uppercase tracking-wider text-[var(--primary)] font-body">
                        {t('label')}
                    </span>
                    <h1 className="mt-4 font-display text-4xl md:text-5xl text-[var(--foreground)]">
                        {t('title')}
                    </h1>
                    <p className="mt-4 text-[var(--muted)] max-w-2xl mx-auto">
                        {t('description')}
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">
                    {/* Lookup Form */}
                    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6 mb-8">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="orderNumber" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                    {t('orderNumber')}
                                </label>
                                <input
                                    type="text"
                                    id="orderNumber"
                                    value={orderNumber}
                                    onChange={(e) => setOrderNumber(e.target.value)}
                                    placeholder={t('orderNumberPlaceholder')}
                                    required
                                    className="w-full px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                    {t('email')}
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('emailPlaceholder')}
                                    required
                                    className="w-full px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity font-medium"
                            >
                                {loading ? t('searching') : t('trackOrder')}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
                                {t('notFound')}
                            </div>
                        )}
                    </div>

                    {/* Order Result */}
                    {order && statusInfo && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* Status Banner */}
                            <div className={`p-6 rounded-xl border ${statusInfo.color} text-center`}>
                                <span className="text-3xl mb-2 block">{statusInfo.icon}</span>
                                <h2 className="text-xl font-display font-semibold">
                                    {statusInfo.label}
                                </h2>
                            </div>

                            {/* Order Details */}
                            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden">
                                <div className="p-6 border-b border-[var(--border)]">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div>
                                            <p className="text-sm text-[var(--muted)]">{t('orderNumber')}</p>
                                            <p className="text-xl font-display text-[var(--primary)] font-semibold">
                                                #{order.orderNumber}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-[var(--muted)]">{t('orderDate')}</p>
                                            <p className="text-[var(--foreground)]">
                                                {formatDate(order.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="p-6 border-b border-[var(--border)] bg-[var(--background)]">
                                    <h3 className="text-sm font-medium text-[var(--foreground)] mb-4">
                                        {t('timeline')}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        {['PAID', 'SHIPPED', 'DELIVERED'].map((status, index) => {
                                            const isComplete =
                                                (status === 'PAID' && order.paidAt) ||
                                                (status === 'SHIPPED' && order.shippedAt) ||
                                                (status === 'DELIVERED' && order.status === 'DELIVERED');
                                            const isCurrent = order.status === status;

                                            return (
                                                <div key={status} className="flex-1 flex items-center">
                                                    <div className={`flex flex-col items-center ${index > 0 ? 'flex-1' : ''}`}>
                                                        {index > 0 && (
                                                            <div className={`h-0.5 w-full mb-2 ${isComplete ? 'bg-green-500' : 'bg-[var(--border)]'}`} />
                                                        )}
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${isComplete ? 'bg-green-500 text-white' :
                                                                isCurrent ? 'bg-blue-500 text-white' :
                                                                    'bg-[var(--border)] text-[var(--muted)]'
                                                            }`}>
                                                            {isComplete ? '✓' : index + 1}
                                                        </div>
                                                        <span className="text-xs text-[var(--muted)] mt-1 text-center">
                                                            {statusConfig[status]?.label.split(' - ')[0] || status}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="p-6 border-b border-[var(--border)]">
                                    <h3 className="text-sm font-medium text-[var(--foreground)] mb-4">
                                        {t('items')} ({order.items.length})
                                    </h3>
                                    <div className="space-y-4">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex gap-4">
                                                <div className="relative w-16 h-16 bg-[var(--background)] rounded-lg overflow-hidden flex-shrink-0">
                                                    {item.imageUrl ? (
                                                        <Image
                                                            src={item.imageUrl}
                                                            alt={item.productTitle}
                                                            fill
                                                            className="object-cover"
                                                            sizes="64px"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <Link
                                                        href={`/shop/${item.productSlug}`}
                                                        className="font-body text-[var(--foreground)] hover:text-[var(--primary)] transition-colors line-clamp-2"
                                                    >
                                                        {item.productTitle}
                                                    </Link>
                                                    <p className="text-sm text-[var(--muted)]">
                                                        {t('quantity')}: {item.quantity}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-display text-[var(--primary)] font-semibold">
                                                        {formatPrice(item.price)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Totals */}
                                <div className="p-6 bg-[var(--background)]">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[var(--muted)]">{t('subtotal')}</span>
                                            <span className="text-[var(--foreground)]">{formatPrice(order.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[var(--muted)]">{t('shipping')}</span>
                                            <span className="text-[var(--foreground)]">{formatPrice(order.shippingCost)}</span>
                                        </div>
                                        {order.tax > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-[var(--muted)]">{t('tax')}</span>
                                                <span className="text-[var(--foreground)]">{formatPrice(order.tax)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-lg font-display font-semibold pt-2 border-t border-[var(--border)]">
                                            <span>{t('total')}</span>
                                            <span className="text-[var(--primary)]">{formatPrice(order.total)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                {order.shippingAddress && (
                                    <div className="p-6 border-t border-[var(--border)]">
                                        <h3 className="text-sm font-medium text-[var(--foreground)] mb-2">
                                            {t('shippingAddress')}
                                        </h3>
                                        <div className="text-[var(--muted)]">
                                            <p>{order.shippingName}</p>
                                            <p>{order.shippingAddress}</p>
                                            <p>{order.shippingPostal} {order.shippingCity}</p>
                                            <p>{order.shippingCountry}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Help Section */}
                            <div className="text-center p-6 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                                <p className="text-[var(--muted)] mb-4">
                                    {t('needHelp')}
                                </p>
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--border)] rounded-lg hover:bg-[var(--background)] transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {t('contactUs')}
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
