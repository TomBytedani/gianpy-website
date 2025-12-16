import Link from 'next/link';
import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { Prisma, OrderStatus } from '@/generated/prisma';
import OrderFilters from '@/components/admin/OrderFilters';

interface FilterParams {
    search?: string;
    status?: string;
    date?: string;
}

async function getOrders(filters: FilterParams) {
    const where: Prisma.OrderWhereInput = {};

    if (filters.search) {
        where.OR = [
            { orderNumber: { contains: filters.search, mode: 'insensitive' } },
            { shippingName: { contains: filters.search, mode: 'insensitive' } },
            { shippingEmail: { contains: filters.search, mode: 'insensitive' } },
            { user: { name: { contains: filters.search, mode: 'insensitive' } } },
            { user: { email: { contains: filters.search, mode: 'insensitive' } } },
        ];
    }
    if (filters.status && Object.values(OrderStatus).includes(filters.status as OrderStatus)) {
        where.status = filters.status as OrderStatus;
    }
    if (filters.date) {
        const dateStart = new Date(filters.date);
        const dateEnd = new Date(filters.date);
        dateEnd.setDate(dateEnd.getDate() + 1);
        where.createdAt = {
            gte: dateStart,
            lt: dateEnd,
        };
    }

    return prisma.order.findMany({
        where,
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
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
}

interface PageProps {
    searchParams: Promise<{ search?: string; status?: string; date?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const filters: FilterParams = {
        search: params.search,
        status: params.status,
        date: params.date,
    };

    const orders = await getOrders(filters);

    const statusColors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        PAID: 'bg-green-100 text-green-800',
        SHIPPED: 'bg-blue-100 text-blue-800',
        DELIVERED: 'bg-purple-100 text-purple-800',
        CANCELLED: 'bg-red-100 text-red-800',
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('it-IT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(date));
    };

    return (
        <div className="pt-16">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-display text-3xl text-[var(--foreground)]">Ordini</h1>
                    <p className="mt-1 text-[var(--muted)]">
                        Gestisci e monitora gli ordini dei clienti
                    </p>
                </div>
            </div>

            {/* Filters */}
            <Suspense fallback={
                <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border)] mb-6">
                    <div className="flex flex-wrap gap-4 animate-pulse">
                        <div className="flex-1 min-w-[200px] h-10 bg-[var(--border)] rounded-lg"></div>
                        <div className="w-32 h-10 bg-[var(--border)] rounded-lg"></div>
                        <div className="w-36 h-10 bg-[var(--border)] rounded-lg"></div>
                    </div>
                </div>
            }>
                <OrderFilters />
            </Suspense>

            {/* Orders Table */}
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden">
                {orders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[var(--background)]">
                                <tr className="text-left text-xs text-[var(--muted)] uppercase tracking-wider">
                                    <th className="px-6 py-4">Ordine</th>
                                    <th className="px-6 py-4">Cliente</th>
                                    <th className="px-6 py-4">Articoli</th>
                                    <th className="px-6 py-4">Totale</th>
                                    <th className="px-6 py-4">Stato</th>
                                    <th className="px-6 py-4">Data</th>
                                    <th className="px-6 py-4">Azioni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-[var(--background)] transition-colors">
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                                className="font-body text-[var(--primary)] hover:underline"
                                            >
                                                #{order.orderNumber}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-body text-[var(--foreground)]">
                                                    {order.shippingName || order.user?.name || 'Ospite'}
                                                </p>
                                                <p className="text-sm text-[var(--muted)]">
                                                    {order.shippingEmail || order.user?.email}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex -space-x-2">
                                                {order.items.slice(0, 3).map((item, idx) => (
                                                    <div
                                                        key={item.id}
                                                        className="w-8 h-8 rounded-lg bg-[var(--background)] border-2 border-[var(--surface)] overflow-hidden"
                                                        style={{ zIndex: 3 - idx }}
                                                    >
                                                        {item.product?.images?.[0] ? (
                                                            <img
                                                                src={item.product.images[0].url}
                                                                alt={item.productTitle}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[var(--muted)] text-xs">
                                                                {item.productTitle.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <div className="w-8 h-8 rounded-lg bg-[var(--muted)] border-2 border-[var(--surface)] flex items-center justify-center text-xs text-white">
                                                        +{order.items.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm text-[var(--muted)] mt-1">
                                                {order.items.length} {order.items.length === 1 ? 'articolo' : 'articoli'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 font-body">
                                            €{Number(order.total).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${statusColors[order.status]}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[var(--muted)]">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="p-2 text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
                                                    title="Vedi Dettagli"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <svg className="w-16 h-16 mx-auto text-[var(--muted)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="font-display text-xl text-[var(--foreground)] mb-2">Nessun ordine ancora</h3>
                        <p className="text-[var(--muted)]">Quando i clienti effettueranno ordini, appariranno qui</p>
                    </div>
                )}
            </div>

            {/* Pagination placeholder */}
            {orders.length > 0 && (
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-[var(--muted)]">
                        Mostrando {orders.length} ordini
                    </p>
                </div>
            )}
        </div>
    );
}
