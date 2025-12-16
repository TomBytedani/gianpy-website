import { prisma } from '@/lib/prisma';
import { Decimal } from '@/generated/prisma/runtime/library';

async function getStats() {
    const [
        totalProducts,
        availableProducts,
        soldProducts,
        reservedProducts,
        totalOrders,
        pendingOrders,
        paidOrders,
        recentOrders,
    ] = await Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { status: 'AVAILABLE' } }),
        prisma.product.count({ where: { status: 'SOLD' } }),
        prisma.product.count({ where: { status: 'RESERVED' } }),
        prisma.order.count(),
        prisma.order.count({ where: { status: 'PENDING' } }),
        prisma.order.count({ where: { status: 'PAID' } }),
        prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                items: true,
            },
        }),
    ]);

    // Calculate revenue from paid orders
    const paidOrdersWithTotal = await prisma.order.aggregate({
        where: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } },
        _sum: { total: true },
    });

    const totalRevenue = paidOrdersWithTotal._sum.total || new Decimal(0);

    return {
        totalProducts,
        availableProducts,
        soldProducts,
        reservedProducts,
        totalOrders,
        pendingOrders,
        paidOrders,
        recentOrders,
        totalRevenue: Number(totalRevenue),
    };
}

export default async function AdminDashboardPage() {
    const stats = await getStats();

    const statCards = [
        {
            label: 'Prodotti Totali',
            value: stats.totalProducts,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
            color: 'var(--primary)',
        },
        {
            label: 'Disponibili',
            value: stats.availableProducts,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: '#22c55e',
        },
        {
            label: 'Venduti',
            value: stats.soldProducts,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            color: '#6366f1',
        },
        {
            label: 'Ricavi Totali',
            value: `€${stats.totalRevenue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: '#f59e0b',
        },
    ];

    return (
        <div className="pt-16">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="font-display text-3xl text-[var(--foreground)]">Pannello di Controllo</h1>
                <p className="mt-1 text-[var(--muted)]">
                    Benvenuto nel pannello amministrativo. Ecco una panoramica del tuo negozio.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)]"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[var(--muted)] font-body">{stat.label}</p>
                                <p className="mt-1 text-3xl font-display" style={{ color: stat.color }}>
                                    {stat.value}
                                </p>
                            </div>
                            <div style={{ color: stat.color }}>{stat.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Orders Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)]">
                    <h3 className="font-display text-lg text-[var(--foreground)] mb-4">Stato Ordini</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[var(--muted)]">Ordini Totali</span>
                            <span className="font-body text-[var(--foreground)]">{stats.totalOrders}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                <span className="text-[var(--muted)]">In Attesa</span>
                            </span>
                            <span className="font-body text-yellow-600">{stats.pendingOrders}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span className="text-[var(--muted)]">Pagati</span>
                            </span>
                            <span className="font-body text-green-600">{stats.paidOrders}</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display text-lg text-[var(--foreground)]">Ordini Recenti</h3>
                        <a href="/admin/orders" className="text-sm text-[var(--primary)] hover:underline">
                            Vedi tutti
                        </a>
                    </div>
                    {stats.recentOrders.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)]">
                                        <th className="pb-3">Ordine</th>
                                        <th className="pb-3">Articoli</th>
                                        <th className="pb-3">Totale</th>
                                        <th className="pb-3">Stato</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {stats.recentOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="py-3 font-body text-sm">
                                                #{order.orderNumber}
                                            </td>
                                            <td className="py-3 text-sm text-[var(--muted)]">
                                                {order.items.length} articolo/i
                                            </td>
                                            <td className="py-3 font-body text-sm">
                                                €{Number(order.total).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-3">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs rounded-full ${order.status === 'PAID'
                                                        ? 'bg-green-100 text-green-800'
                                                        : order.status === 'PENDING'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : order.status === 'SHIPPED'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-[var(--muted)] text-center py-8">Nessun ordine ancora</p>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)]">
                <h3 className="font-display text-lg text-[var(--foreground)] mb-4">Azioni Rapide</h3>
                <div className="flex flex-wrap gap-4">
                    <a
                        href="/admin/products/new"
                        className="btn-link inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Aggiungi Prodotto
                    </a>
                    <a
                        href="/admin/orders"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--border)] text-[var(--foreground)] rounded-lg hover:bg-[var(--background)] transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Gestisci Ordini
                    </a>
                    <a
                        href="/admin/categories"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--border)] text-[var(--foreground)] rounded-lg hover:bg-[var(--background)] transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Gestisci Categorie
                    </a>
                </div>
            </div>
        </div>
    );
}
