import Link from 'next/link';
import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { Prisma, ProductStatus } from '@/generated/prisma';
import ProductFilters from '@/components/admin/ProductFilters';
import ProductListItem from '@/components/admin/ProductListItem';

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

    return (
        <div className="pt-16">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="font-display text-2xl sm:text-3xl text-[var(--foreground)]">Prodotti</h1>
                    <p className="mt-1 text-sm sm:text-base text-[var(--muted)]">
                        Gestisci il tuo catalogo prodotti
                    </p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="btn-link inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">Aggiungi Prodotto</span>
                    <span className="sm:hidden">Aggiungi</span>
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

            {/* Products List */}
            {products.length > 0 ? (
                <>
                    {/* Mobile Card Layout */}
                    <div className="lg:hidden space-y-4">
                        {products.map((product) => (
                            <ProductListItem
                                key={product.id}
                                product={{
                                    id: product.id,
                                    title: product.title,
                                    slug: product.slug,
                                    price: Number(product.price),
                                    status: product.status,
                                    isFeatured: product.isFeatured,
                                    category: product.category,
                                    images: product.images,
                                }}
                            />
                        ))}
                    </div>

                    {/* Desktop Table Layout */}
                    <div className="hidden lg:block bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden">
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
                                        <ProductListItem
                                            key={product.id}
                                            product={{
                                                id: product.id,
                                                title: product.title,
                                                slug: product.slug,
                                                price: Number(product.price),
                                                status: product.status,
                                                isFeatured: product.isFeatured,
                                                category: product.category,
                                                images: product.images,
                                            }}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-12 text-center">
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

            {/* Product count */}
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

