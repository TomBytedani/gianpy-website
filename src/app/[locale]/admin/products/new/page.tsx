import { prisma } from '@/lib/prisma';
import ProductForm from '@/components/admin/ProductForm';

async function getCategories() {
    return prisma.category.findMany({
        orderBy: { sortOrder: 'asc' },
        select: {
            id: true,
            displayName: true,
        },
    });
}

export default async function NewProductPage() {
    const categories = await getCategories();

    return (
        <div className="pt-16 max-w-4xl">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="font-display text-3xl text-[var(--foreground)]">Add New Product</h1>
                <p className="mt-1 text-[var(--muted)]">
                    Create a new product in your catalog
                </p>
            </div>

            <ProductForm categories={categories} />
        </div>
    );
}
