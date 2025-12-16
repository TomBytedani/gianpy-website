import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteContext = {
    params: Promise<{ slug: string }>;
};

// GET /api/products/by-slug/[slug] - Get a product by its slug
export async function GET(req: NextRequest, context: RouteContext) {
    try {
        const { slug } = await context.params;

        const product = await prisma.product.findUnique({
            where: { slug },
            include: {
                category: true,
                images: {
                    orderBy: { sortOrder: 'asc' },
                },
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Transform the response for frontend consumption
        return NextResponse.json({
            id: product.id,
            title: product.title,
            titleEn: product.titleEn,
            slug: product.slug,
            description: product.description,
            descriptionEn: product.descriptionEn,
            price: Number(product.price),
            status: product.status,
            dimensions: product.dimensions,
            materials: product.materials,
            condition: product.condition,
            provenance: product.provenance,
            isFeatured: product.isFeatured,
            category: product.category ? {
                name: product.category.name,
                displayName: product.category.displayName,
                displayNameEn: product.category.displayNameEn,
            } : null,
            images: product.images.map(img => ({
                id: img.id,
                url: img.url,
                alt: img.alt,
                isPrimary: img.isPrimary,
            })),
            tags: product.tags.map(pt => pt.tag.name),
        });
    } catch (error) {
        console.error('Error fetching product by slug:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}
