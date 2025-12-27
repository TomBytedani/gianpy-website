'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface OrderItem {
    id: string;
    productTitle: string;
    productSlug: string;
    price: string | number;
    quantity: number;
    product: {
        id: string;
        images: { url: string; isPrimary: boolean }[];
    };
}

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    subtotal: string | number;
    shippingCost: string | number;
    tax: string | number;
    total: string | number;
    stripePaymentIntentId: string | null;
    stripeSessionId: string | null;
    shippingName: string | null;
    shippingEmail: string | null;
    shippingPhone: string | null;
    shippingAddress: string | null;
    shippingCity: string | null;
    shippingPostal: string | null;
    shippingCountry: string | null;
    customerNotes: string | null;
    internalNotes: string | null;
    createdAt: string;
    updatedAt: string;
    paidAt: string | null;
    shippedAt: string | null;
    user: {
        id: string;
        name: string | null;
        email: string;
    } | null;
    items: OrderItem[];
}

const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    PAID: 'bg-green-100 text-green-800 border-green-200',
    SHIPPED: 'bg-blue-100 text-blue-800 border-blue-200',
    DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels: Record<string, string> = {
    PENDING: 'In Attesa',
    PAID: 'Pagato',
    SHIPPED: 'Spedito',
    DELIVERED: 'Consegnato',
    CANCELLED: 'Annullato',
};

export default function AdminOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // Shipping modal state
    const [showShippingModal, setShowShippingModal] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [carrierName, setCarrierName] = useState('');
    const [trackingUrl, setTrackingUrl] = useState('');
    const [sendNotification, setSendNotification] = useState(true);

    // Internal notes state
    const [internalNotes, setInternalNotes] = useState('');
    const [notesEditing, setNotesEditing] = useState(false);

    // Resend notification modal state
    const [showResendModal, setShowResendModal] = useState(false);
    const [resendTrackingNumber, setResendTrackingNumber] = useState('');
    const [resendCarrierName, setResendCarrierName] = useState('');
    const [resendTrackingUrl, setResendTrackingUrl] = useState('');
    const [updateTracking, setUpdateTracking] = useState(false);
    const [resendSuccess, setResendSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    async function fetchOrder() {
        try {
            setLoading(true);
            const response = await fetch(`/api/orders/${orderId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch order');
            }
            const data = await response.json();
            setOrder(data);
            setInternalNotes(data.internalNotes || '');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }

    async function updateOrderStatus(newStatus: string, shippingData?: {
        trackingNumber?: string;
        carrierName?: string;
        trackingUrl?: string;
        sendNotification?: boolean;
    }) {
        if (!order) return;

        startTransition(async () => {
            try {
                const response = await fetch(`/api/orders/${orderId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: newStatus,
                        ...shippingData,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to update order');
                }

                // Refresh order data
                await fetchOrder();
                setShowShippingModal(false);
                setTrackingNumber('');
                setCarrierName('');
                setTrackingUrl('');
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to update order');
            }
        });
    }

    async function updateInternalNotes() {
        if (!order) return;

        startTransition(async () => {
            try {
                const response = await fetch(`/api/orders/${orderId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ internalNotes }),
                });

                if (!response.ok) {
                    throw new Error('Failed to update notes');
                }

                await fetchOrder();
                setNotesEditing(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to update notes');
            }
        });
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

    function formatPrice(price: number | string) {
        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: 'EUR',
        }).format(Number(price));
    }

    if (loading) {
        return (
            <div className="pt-16">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-[var(--border)] rounded w-1/3"></div>
                    <div className="h-64 bg-[var(--border)] rounded"></div>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="pt-16">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <h2 className="text-xl font-display text-red-800 mb-2">Errore</h2>
                    <p className="text-red-600">{error || 'Ordine non trovato'}</p>
                    <Link
                        href="/admin/orders"
                        className="mt-4 inline-block text-[var(--primary)] hover:underline"
                    >
                        ← Torna agli ordini
                    </Link>
                </div>
            </div>
        );
    }

    const canMarkAsShipped = order.status === 'PAID';
    const canMarkAsDelivered = order.status === 'SHIPPED';
    const canCancel = order.status !== 'CANCELLED' && order.status !== 'DELIVERED';
    const canResendNotification = order.status === 'SHIPPED' || order.status === 'DELIVERED';

    async function resendShippingNotification() {
        if (!order) return;

        startTransition(async () => {
            try {
                const response = await fetch(`/api/orders/${orderId}/resend-notification`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        trackingNumber: resendTrackingNumber || undefined,
                        carrierName: resendCarrierName || undefined,
                        trackingUrl: resendTrackingUrl || undefined,
                        updateTracking,
                    }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to resend notification');
                }

                const data = await response.json();
                setResendSuccess(data.message || 'Email inviata con successo!');
                setShowResendModal(false);
                setResendTrackingNumber('');
                setResendCarrierName('');
                setResendTrackingUrl('');
                setUpdateTracking(false);

                // Refresh order data if tracking was updated
                if (updateTracking) {
                    await fetchOrder();
                }

                // Clear success message after 5 seconds
                setTimeout(() => setResendSuccess(null), 5000);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to resend notification');
            }
        });
    }

    return (
        <div className="pt-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <Link
                        href="/admin/orders"
                        className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] mb-2 inline-flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Torna agli ordini
                    </Link>
                    <h1 className="font-display text-3xl text-[var(--foreground)]">
                        Ordine #{order.orderNumber}
                    </h1>
                    <p className="mt-1 text-[var(--muted)]">
                        Creato il {formatDate(order.createdAt)}
                    </p>
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${statusColors[order.status]}`}>
                    <span className="font-medium">{statusLabels[order.status]}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden">
                        <div className="p-4 border-b border-[var(--border)]">
                            <h2 className="font-display text-lg text-[var(--foreground)]">
                                Articoli ({order.items.length})
                            </h2>
                        </div>
                        <div className="divide-y divide-[var(--border)]">
                            {order.items.map((item) => (
                                <div key={item.id} className="p-4 flex gap-4">
                                    <div className="relative w-20 h-20 bg-[var(--background)] rounded-lg overflow-hidden flex-shrink-0">
                                        {item.product.images[0]?.url ? (
                                            <Image
                                                src={item.product.images[0].url}
                                                alt={item.productTitle}
                                                fill
                                                className="object-cover"
                                                sizes="80px"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                        <p className="text-sm text-[var(--muted)] mt-1">
                                            Quantità: {item.quantity}
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
                        {/* Totals */}
                        <div className="p-4 bg-[var(--background)] space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--muted)]">Subtotale</span>
                                <span className="text-[var(--foreground)]">{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--muted)]">Spedizione</span>
                                <span className="text-[var(--foreground)]">{formatPrice(order.shippingCost)}</span>
                            </div>
                            {Number(order.tax) > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--muted)]">IVA</span>
                                    <span className="text-[var(--foreground)]">{formatPrice(order.tax)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-display font-semibold pt-2 border-t border-[var(--border)]">
                                <span>Totale</span>
                                <span className="text-[var(--primary)]">{formatPrice(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Internal Notes */}
                    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-display text-lg text-[var(--foreground)]">
                                Note Interne
                            </h2>
                            {!notesEditing && (
                                <button
                                    onClick={() => setNotesEditing(true)}
                                    className="text-sm text-[var(--primary)] hover:underline"
                                >
                                    Modifica
                                </button>
                            )}
                        </div>
                        {notesEditing ? (
                            <div className="space-y-3">
                                <textarea
                                    value={internalNotes}
                                    onChange={(e) => setInternalNotes(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
                                    placeholder="Aggiungi note interne su questo ordine..."
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={updateInternalNotes}
                                        disabled={isPending}
                                        className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                                    >
                                        {isPending ? 'Salvataggio...' : 'Salva'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setInternalNotes(order.internalNotes || '');
                                            setNotesEditing(false);
                                        }}
                                        className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--background)]"
                                    >
                                        Annulla
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-[var(--muted)] whitespace-pre-wrap">
                                {order.internalNotes || 'Nessuna nota interna'}
                            </p>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Actions */}
                    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4">
                        <h2 className="font-display text-lg text-[var(--foreground)] mb-4">
                            Azioni
                        </h2>
                        <div className="space-y-3">
                            {canMarkAsShipped && (
                                <button
                                    onClick={() => setShowShippingModal(true)}
                                    disabled={isPending}
                                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                    Segna come Spedito
                                </button>
                            )}
                            {canMarkAsDelivered && (
                                <button
                                    onClick={() => updateOrderStatus('DELIVERED')}
                                    disabled={isPending}
                                    className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Segna come Consegnato
                                </button>
                            )}
                            {canCancel && (
                                <button
                                    onClick={() => {
                                        if (confirm('Sei sicuro di voler annullare questo ordine?')) {
                                            updateOrderStatus('CANCELLED');
                                        }
                                    }}
                                    disabled={isPending}
                                    className="w-full px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Annulla Ordine
                                </button>
                            )}
                            {canResendNotification && (
                                <button
                                    onClick={() => setShowResendModal(true)}
                                    disabled={isPending}
                                    className="w-full px-4 py-3 border border-[var(--primary)] text-[var(--primary)] rounded-lg hover:bg-[var(--primary)]/10 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Reinvia Notifica Spedizione
                                </button>
                            )}
                            {resendSuccess && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                                    ✓ {resendSuccess}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4">
                        <h2 className="font-display text-lg text-[var(--foreground)] mb-4">
                            Cliente
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-[var(--muted)]">Nome</p>
                                <p className="text-[var(--foreground)]">
                                    {order.shippingName || order.user?.name || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-[var(--muted)]">Email</p>
                                <a
                                    href={`mailto:${order.shippingEmail || order.user?.email}`}
                                    className="text-[var(--primary)] hover:underline"
                                >
                                    {order.shippingEmail || order.user?.email || 'N/A'}
                                </a>
                            </div>
                            {order.shippingPhone && (
                                <div>
                                    <p className="text-sm text-[var(--muted)]">Telefono</p>
                                    <a
                                        href={`tel:${order.shippingPhone}`}
                                        className="text-[var(--primary)] hover:underline"
                                    >
                                        {order.shippingPhone}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4">
                            <h2 className="font-display text-lg text-[var(--foreground)] mb-4">
                                Indirizzo di Spedizione
                            </h2>
                            <div className="text-[var(--foreground)]">
                                <p>{order.shippingName}</p>
                                <p>{order.shippingAddress}</p>
                                <p>{order.shippingPostal} {order.shippingCity}</p>
                                <p>{order.shippingCountry}</p>
                            </div>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4">
                        <h2 className="font-display text-lg text-[var(--foreground)] mb-4">
                            Cronologia
                        </h2>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                                <div>
                                    <p className="text-sm font-medium text-[var(--foreground)]">Ordine creato</p>
                                    <p className="text-xs text-[var(--muted)]">{formatDate(order.createdAt)}</p>
                                </div>
                            </div>
                            {order.paidAt && (
                                <div className="flex gap-3">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                                    <div>
                                        <p className="text-sm font-medium text-[var(--foreground)]">Pagamento ricevuto</p>
                                        <p className="text-xs text-[var(--muted)]">{formatDate(order.paidAt)}</p>
                                    </div>
                                </div>
                            )}
                            {order.shippedAt && (
                                <div className="flex gap-3">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                                    <div>
                                        <p className="text-sm font-medium text-[var(--foreground)]">Spedito</p>
                                        <p className="text-xs text-[var(--muted)]">{formatDate(order.shippedAt)}</p>
                                    </div>
                                </div>
                            )}
                            {order.status === 'DELIVERED' && (
                                <div className="flex gap-3">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500"></div>
                                    <div>
                                        <p className="text-sm font-medium text-[var(--foreground)]">Consegnato</p>
                                        <p className="text-xs text-[var(--muted)]">{formatDate(order.updatedAt)}</p>
                                    </div>
                                </div>
                            )}
                            {order.status === 'CANCELLED' && (
                                <div className="flex gap-3">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-red-500"></div>
                                    <div>
                                        <p className="text-sm font-medium text-[var(--foreground)]">Annullato</p>
                                        <p className="text-xs text-[var(--muted)]">{formatDate(order.updatedAt)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stripe Info */}
                    {order.stripePaymentIntentId && (
                        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4">
                            <h2 className="font-display text-lg text-[var(--foreground)] mb-4">
                                Info Pagamento
                            </h2>
                            <div className="text-xs text-[var(--muted)] font-mono break-all">
                                <p className="mb-1">Payment Intent:</p>
                                <p className="text-[var(--foreground)]">{order.stripePaymentIntentId}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Shipping Modal */}
            {showShippingModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--surface)] rounded-xl max-w-md w-full p-6">
                        <h3 className="font-display text-xl text-[var(--foreground)] mb-4">
                            Segna come Spedito
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                                    Corriere
                                </label>
                                <input
                                    type="text"
                                    value={carrierName}
                                    onChange={(e) => setCarrierName(e.target.value)}
                                    placeholder="es. DHL, BRT, Poste Italiane..."
                                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                                    Numero di Tracciamento
                                </label>
                                <input
                                    type="text"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    placeholder="es. 1Z999AA10123456784"
                                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                                    Link di Tracciamento (opzionale)
                                </label>
                                <input
                                    type="url"
                                    value={trackingUrl}
                                    onChange={(e) => setTrackingUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="sendNotification"
                                    checked={sendNotification}
                                    onChange={(e) => setSendNotification(e.target.checked)}
                                    className="w-4 h-4 accent-[var(--primary)]"
                                />
                                <label htmlFor="sendNotification" className="text-sm text-[var(--foreground)]">
                                    Invia email di notifica al cliente
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => updateOrderStatus('SHIPPED', {
                                    trackingNumber: trackingNumber || undefined,
                                    carrierName: carrierName || undefined,
                                    trackingUrl: trackingUrl || undefined,
                                    sendNotification,
                                })}
                                disabled={isPending}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isPending ? 'Aggiornamento...' : 'Conferma Spedizione'}
                            </button>
                            <button
                                onClick={() => setShowShippingModal(false)}
                                className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--background)]"
                            >
                                Annulla
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Resend Notification Modal */}
            {showResendModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--surface)] rounded-xl max-w-md w-full p-6">
                        <h3 className="font-display text-xl text-[var(--foreground)] mb-2">
                            Reinvia Notifica Spedizione
                        </h3>
                        <p className="text-sm text-[var(--muted)] mb-4">
                            L&apos;email verrà inviata a: {order?.shippingEmail || order?.user?.email}
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                                    Corriere (opzionale)
                                </label>
                                <input
                                    type="text"
                                    value={resendCarrierName}
                                    onChange={(e) => setResendCarrierName(e.target.value)}
                                    placeholder="es. DHL, BRT, Poste Italiane..."
                                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                                    Numero di Tracciamento (opzionale)
                                </label>
                                <input
                                    type="text"
                                    value={resendTrackingNumber}
                                    onChange={(e) => setResendTrackingNumber(e.target.value)}
                                    placeholder="es. 1Z999AA10123456784"
                                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                                    Link di Tracciamento (opzionale)
                                </label>
                                <input
                                    type="url"
                                    value={resendTrackingUrl}
                                    onChange={(e) => setResendTrackingUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="updateTracking"
                                    checked={updateTracking}
                                    onChange={(e) => setUpdateTracking(e.target.checked)}
                                    className="w-4 h-4 accent-[var(--primary)]"
                                />
                                <label htmlFor="updateTracking" className="text-sm text-[var(--foreground)]">
                                    Aggiorna le note interne con le nuove info di tracking
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={resendShippingNotification}
                                disabled={isPending}
                                className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isPending ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Invio in corso...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                        Invia Email
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setShowResendModal(false);
                                    setResendTrackingNumber('');
                                    setResendCarrierName('');
                                    setResendTrackingUrl('');
                                    setUpdateTracking(false);
                                }}
                                className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--background)]"
                            >
                                Annulla
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
