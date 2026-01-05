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
        month: 'short',
        year: 'numeric',
    }).format(date);
}

export default async function AccountDashboardPage() {
    const session = await auth();
    const t = await getTranslations('account');

    if (!session?.user?.id) {
        redirect('/auth/signin');
    }

    // Fetch recent orders (last 3)
    const recentOrders = await prisma.order.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 3,
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

    // Fetch wishlist preview (last 4)
    const wishlistItems = await prisma.wishlistItem.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 4,
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
    });

    // Get counts
    const orderCount = await prisma.order.count({
        where: { userId: session.user.id },
    });

    const wishlistCount = await prisma.wishlistItem.count({
        where: { userId: session.user.id },
    });

    const statusColors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        PAID: 'bg-green-100 text-green-800',
        SHIPPED: 'bg-blue-100 text-blue-800',
        DELIVERED: 'bg-emerald-100 text-emerald-800',
        CANCELLED: 'bg-red-100 text-red-800',
    };

    // Status translations will be applied inline using t()

    return (
        <div>
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="font-display italic font-semibold text-3xl md:text-4xl text-foreground">
                    {t('welcome')}, {session.user.name || session.user.email}
                </h1>
                <p className="text-muted mt-2 font-body">
                    {t('dashboard.title')}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-display font-semibold text-foreground">{orderCount}</p>
                            <p className="text-sm text-muted font-body">{t('nav.orders')}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-accent/10 rounded-full">
                            <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-display font-semibold text-foreground">{wishlistCount}</p>
                            <p className="text-sm text-muted font-body">{t('nav.wishlist')}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-full">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-display font-semibold text-foreground">
                                {recentOrders.filter(o => o.status === 'DELIVERED').length}
                            </p>
                            <p className="text-sm text-muted font-body">{t('orders.statuses.delivered')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders */}
                <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between bg-background-alt">
                        <h2 className="font-display italic text-lg text-foreground">
                            {t('dashboard.recentOrders')}
                        </h2>
                        <Link
                            href="/account/orders"
                            className="text-sm text-primary hover:text-primary-dark transition-colors font-body"
                        >
                            {t('dashboard.viewAllOrders')} →
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <div className="p-8 text-center">
                            <svg className="w-12 h-12 mx-auto text-muted opacity-50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="text-muted font-body">{t('dashboard.noRecentOrders')}</p>
                            <Link href="/shop" className="mt-4 inline-block">
                                <Button variant="primary" size="sm">
                                    {t('wishlist.browseCollection')}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <ul className="divide-y divide-border">
                            {recentOrders.map((order) => (
                                <li key={order.id} className="p-4 hover:bg-background-alt transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-body text-sm font-medium text-foreground">
                                            #{order.orderNumber}
                                        </span>
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusColors[order.status]}`}>
                                            {t(`orders.statuses.${order.status.toLowerCase()}`)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted font-body">
                                            {formatDate(order.createdAt)}
                                        </span>
                                        <span className="font-display text-primary font-semibold">
                                            {formatPrice(Number(order.total))}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Wishlist Preview */}
                <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between bg-background-alt">
                        <h2 className="font-display italic text-lg text-foreground">
                            {t('dashboard.wishlistPreview')}
                        </h2>
                        <Link
                            href="/account/wishlist"
                            className="text-sm text-primary hover:text-primary-dark transition-colors font-body"
                        >
                            {t('dashboard.viewWishlist')} →
                        </Link>
                    </div>

                    {wishlistItems.length === 0 ? (
                        <div className="p-8 text-center">
                            <svg className="w-12 h-12 mx-auto text-muted opacity-50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <p className="text-muted font-body">{t('dashboard.emptyWishlist')}</p>
                            <Link href="/shop" className="mt-4 inline-block">
                                <Button variant="primary" size="sm">
                                    {t('wishlist.browseCollection')}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 p-4">
                            {wishlistItems.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/shop/${item.product.slug}`}
                                    className="group"
                                >
                                    <div className="relative aspect-square bg-background-alt rounded-md overflow-hidden mb-2">
                                        {item.product.images[0]?.url ? (
                                            <Image
                                                src={item.product.images[0].url}
                                                alt={item.product.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                sizes="(max-width: 768px) 50vw, 150px"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                        {item.product.status === 'SOLD' && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="font-script text-xl text-white">{t('wishlist.soldAlert')}</span>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-body text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                        {item.product.title}
                                    </h3>
                                    <p className="font-display text-sm text-primary font-semibold">
                                        {formatPrice(Number(item.product.price))}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-white rounded-lg border border-border p-6 shadow-sm">
                <h2 className="font-display italic text-lg text-foreground mb-4">
                    {t('dashboard.quickActions')}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link
                        href="/shop"
                        className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                        <svg className="w-8 h-8 text-muted group-hover:text-primary transition-colors mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span className="text-sm font-body text-foreground group-hover:text-primary transition-colors">
                            {t('dashboard.actions.shop')}
                        </span>
                    </Link>
                    <Link
                        href="/contact"
                        className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                        <svg className="w-8 h-8 text-muted group-hover:text-primary transition-colors mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-body text-foreground group-hover:text-primary transition-colors">
                            {t('dashboard.actions.contactUs')}
                        </span>
                    </Link>
                    <Link
                        href="/account/settings"
                        className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                        <svg className="w-8 h-8 text-muted group-hover:text-primary transition-colors mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm font-body text-foreground group-hover:text-primary transition-colors">
                            {t('dashboard.actions.settings')}
                        </span>
                    </Link>
                    <Link
                        href="/cart"
                        className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                        <svg className="w-8 h-8 text-muted group-hover:text-primary transition-colors mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span className="text-sm font-body text-foreground group-hover:text-primary transition-colors">
                            {t('dashboard.actions.cart')}
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
