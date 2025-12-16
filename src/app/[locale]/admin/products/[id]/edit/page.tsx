import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductForm from '@/components/admin/ProductForm';

type Props = {
    params: Promise<{ id: string; locale: string }>;
};

async function getProduct(id: string) {
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            category: true,
            images: {
                orderBy: { sortOrder: 'asc' },
            },
        },
    });
    return product;
}

async function getCategories() {
    return prisma.category.findMany({
        orderBy: { sortOrder: 'asc' },
        select: {
            id: true,
            displayName: true,
        },
    });
}

export default async function EditProductPage({ params }: Props) {
    const { id } = await params;
    const [product, categories] = await Promise.all([
        getProduct(id),
        getCategories(),
    ]);

    if (!product) {
        notFound();
    }

    const initialData = {
        id: product.id,
        title: product.title,
        titleEn: product.titleEn || '',
        slug: product.slug,
        description: product.description,
        descriptionEn: product.descriptionEn || '',
        price: Number(product.price),
        status: product.status,
        categoryId: product.categoryId || '',
        dimensions: product.dimensions || '',
        materials: product.materials || '',
        materialsEn: product.materialsEn || '',
        condition: product.condition || '',
        conditionEn: product.conditionEn || '',
        provenance: product.provenance || '',
        provenanceEn: product.provenanceEn || '',
        isFeatured: product.isFeatured,
        images: product.images.map((img) => ({
            id: img.id,
            url: img.url,
            alt: img.alt,
            isPrimary: img.isPrimary,
            sortOrder: img.sortOrder,
        })),
    };

    return (
        <div className="pt-16 max-w-4xl">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="font-display text-3xl text-[var(--foreground)]">Edit Product</h1>
                <p className="mt-1 text-[var(--muted)]">
                    Update product details for &ldquo;{product.title}&rdquo;
                </p>
            </div>

            <ProductForm categories={categories} initialData={initialData} />
        </div>
    );
}
