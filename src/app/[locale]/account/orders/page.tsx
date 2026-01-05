import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui';

// Format price helper
function formatPrice(price: number): string {
    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR',
    }).format(price);
}

// Format date helper
function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('it-IT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(date);
}

export default async function OrderHistoryPage() {
    const session = await auth();
    const t = await getTranslations('account');

    if (!session?.user?.id) {
        redirect('/auth/signin');
    }

    // Fetch all orders
    const orders = await prisma.order.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            images: {
                                where: { isPrimary: true },
                                take: 1,
                            },
                        },
                    },
                },
            },
        },
    });

    const statusColors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        PAID: 'bg-green-100 text-green-800 border-green-200',
        SHIPPED: 'bg-blue-100 text-blue-800 border-blue-200',
        DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    };

    // Status translations will be applied inline using t()

    const statusIcons: Record<string, React.ReactNode> = {
        PENDING: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        PAID: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        SHIPPED: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        DELIVERED: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ),
        CANCELLED: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
    };

    return (
        <div>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="font-display italic font-semibold text-3xl md:text-4xl text-foreground">
                    {t('orders.title')}
                </h1>
                <p className="text-muted mt-2 font-body">
                    {t('orders.subtitle')}
                </p>
            </div>

            {orders.length === 0 ? (
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
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                        />
                    </svg>
                    <h2 className="font-display italic text-2xl text-foreground mb-3">
                        {t('orders.noOrders')}
                    </h2>
                    <p className="text-muted font-body mb-6 max-w-md mx-auto">
                        {t('orders.emptyMessage')}
                    </p>
                    <Link href="/shop">
                        <Button variant="primary" size="lg">
                            {t('orders.startShopping')}
                        </Button>
                    </Link>
                </div>
            ) : (
                /* Orders List */
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white rounded-lg border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                        >
                            {/* Order Header */}
                            <div className="p-4 md:p-6 border-b border-border bg-background-alt flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-4 md:gap-6">
                                    <div>
                                        <p className="text-xs text-muted font-body uppercase tracking-wide">
                                            {t('orders.orderNumber')}
                                        </p>
                                        <p className="font-display font-semibold text-foreground">
                                            #{order.orderNumber}
                                        </p>
                                    </div>
                                    <div className="hidden md:block w-px h-8 bg-border"></div>
                                    <div>
                                        <p className="text-xs text-muted font-body uppercase tracking-wide">
                                            {t('orders.orderDate')}
                                        </p>
                                        <p className="font-body text-foreground">
                                            {formatDate(order.createdAt)}
                                        </p>
                                    </div>
                                    <div className="hidden md:block w-px h-8 bg-border"></div>
                                    <div>
                                        <p className="text-xs text-muted font-body uppercase tracking-wide">
                                            {t('orders.total')}
                                        </p>
                                        <p className="font-display font-semibold text-primary">
                                            {formatPrice(Number(order.total))}
                                        </p>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusColors[order.status]}`}>
                                    {statusIcons[order.status]}
                                    <span className="text-sm font-medium">
                                        {t(`orders.statuses.${order.status.toLowerCase()}`)}
                                    </span>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-4 md:p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {order.items.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={`/shop/${item.productSlug}`}
                                            className="flex gap-4 group"
                                        >
                                            <div className="relative w-20 h-20 bg-background-alt rounded-md overflow-hidden flex-shrink-0">
                                                {item.product.images[0]?.url ? (
                                                    <Image
                                                        src={item.product.images[0].url}
                                                        alt={item.productTitle}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                        sizes="80px"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-body text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                                    {item.productTitle}
                                                </h3>
                                                <p className="font-display text-sm text-primary font-semibold mt-1">
                                                    {formatPrice(Number(item.price))}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Order Footer */}
                            {order.shippingAddress && (
                                <div className="px-4 md:px-6 pb-4 md:pb-6">
                                    <div className="pt-4 border-t border-border">
                                        <div className="flex items-start gap-3 text-sm text-muted">
                                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <div className="font-body">
                                                <p className="font-medium text-foreground">{order.shippingName}</p>
                                                <p>{order.shippingAddress}</p>
                                                <p>{order.shippingPostal} {order.shippingCity}, {order.shippingCountry}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
