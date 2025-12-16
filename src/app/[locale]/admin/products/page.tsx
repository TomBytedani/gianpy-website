import Link from 'next/link';
import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { Prisma, ProductStatus } from '@/generated/prisma';
import ProductFilters from '@/components/admin/ProductFilters';

interface FilterParams {
    search?: string;
    category?: string;
    status?: string;
}

async function getProducts(filters: FilterParams) {
    const where: Prisma.ProductWhereInput = {};

    if (filters.search) {
        where.title = { contains: filters.search, mode: 'insensitive' };
    }
    if (filters.category) {
        where.categoryId = filters.category;
    }
    if (filters.status && Object.values(ProductStatus).includes(filters.status as ProductStatus)) {
        where.status = filters.status as ProductStatus;
    }

    const products = await prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            category: true,
            images: {
                where: { isPrimary: true },
                take: 1,
            },
        },
    });
    return products;
}

async function getCategories() {
    return prisma.category.findMany({
        orderBy: { sortOrder: 'asc' },
    });
}

interface PageProps {
    searchParams: Promise<{ search?: string; category?: string; status?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const filters: FilterParams = {
        search: params.search,
        category: params.category,
        status: params.status,
    };

    const [products, categories] = await Promise.all([
        getProducts(filters),
        getCategories(),
    ]);

    const statusColors: Record<string, string> = {
        AVAILABLE: 'bg-green-100 text-green-800',
        SOLD: 'bg-gray-100 text-gray-800',
        RESERVED: 'bg-yellow-100 text-yellow-800',
        COMING_SOON: 'bg-blue-100 text-blue-800',
    };

    return (
        <div className="pt-16">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-display text-3xl text-[var(--foreground)]">Prodotti</h1>
                    <p className="mt-1 text-[var(--muted)]">
                        Gestisci il tuo catalogo prodotti
                    </p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="btn-link inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Aggiungi Prodotto
                </Link>
            </div>

            {/* Filters */}
            <Suspense fallback={
                <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border)] mb-6">
                    <div className="flex flex-wrap gap-4 animate-pulse">
                        <div className="flex-1 min-w-[200px] h-10 bg-[var(--border)] rounded-lg"></div>
                        <div className="w-40 h-10 bg-[var(--border)] rounded-lg"></div>
                        <div className="w-32 h-10 bg-[var(--border)] rounded-lg"></div>
                    </div>
                </div>
            }>
                <ProductFilters categories={categories.map(c => ({ id: c.id, displayName: c.displayName }))} />
            </Suspense>

            {/* Products Table */}
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden">
                {products.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[var(--background)]">
                                <tr className="text-left text-xs text-[var(--muted)] uppercase tracking-wider">
                                    <th className="px-6 py-4">Prodotto</th>
                                    <th className="px-6 py-4">Categoria</th>
                                    <th className="px-6 py-4">Prezzo</th>
                                    <th className="px-6 py-4">Stato</th>
                                    <th className="px-6 py-4">In Evidenza</th>
                                    <th className="px-6 py-4">Azioni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-[var(--background)] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-[var(--background)] overflow-hidden flex-shrink-0">
                                                    {product.images[0] ? (
                                                        <img
                                                            src={product.images[0].url}
                                                            alt={product.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-body text-[var(--foreground)]">{product.title}</p>
                                                    <p className="text-sm text-[var(--muted)]">{product.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[var(--muted)]">
                                            {product.category?.displayName || '—'}
                                        </td>
                                        <td className="px-6 py-4 font-body">
                                            €{Number(product.price).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${statusColors[product.status]}`}>
                                                {product.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.isFeatured ? (
                                                <svg className="w-5 h-5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                </svg>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/products/${product.id}/edit`}
                                                    className="p-2 text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
                                                    title="Modifica"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <Link
                                                    href={`/shop/${product.slug}`}
                                                    className="p-2 text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
                                                    title="Visualizza"
                                                    target="_blank"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="p-2 text-red-400 hover:text-red-600 transition-colors"
                                                    title="Elimina"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <h3 className="font-display text-xl text-[var(--foreground)] mb-2">Nessun prodotto ancora</h3>
                        <p className="text-[var(--muted)] mb-4">Inizia aggiungendo il tuo primo prodotto</p>
                        <Link
                            href="/admin/products/new"
                            className="btn-link inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Aggiungi Prodotto
                        </Link>
                    </div>
                )}
            </div>

            {/* Pagination placeholder */}
            {products.length > 0 && (
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-[var(--muted)]">
                        Mostrando {products.length} prodotti
                    </p>
                    <div className="flex items-center gap-2">
                        {/* Pagination will go here */}
                    </div>
                </div>
            )}
        </div>
    );
}
