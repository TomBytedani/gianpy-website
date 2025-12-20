import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/products - List all products (public, with filters)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const featured = searchParams.get('featured');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        const where: Record<string, unknown> = {};

        if (category) {
            where.categoryId = category;
        }

        if (status) {
            where.status = status;
        }

        if (featured === 'true') {
            where.isFeatured = true;
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
                include: {
                    category: true,
                    images: {
                        orderBy: { sortOrder: 'asc' },
                    },
                },
            }),
            prisma.product.count({ where }),
        ]);

        return NextResponse.json({
            products,
            total,
            limit,
            offset,
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

// POST /api/products - Create a new product (admin only)
export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const {
            title,
            titleEn,
            slug,
            description,
            descriptionEn,
            price,
            status,
            categoryId,
            dimensions,
            materials,
            condition,
            provenance,
            isFeatured,
            images,
            // Shipping overrides
            shippingCost,
            shippingCostIntl,
            requiresSpecialShipping,
            shippingNote,
            shippingNoteEn,
        } = body;

        // Validate required fields
        if (!title || !slug || !description || price === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields: title, slug, description, price' },
                { status: 400 }
            );
        }

        // Check for duplicate slug
        const existingProduct = await prisma.product.findUnique({
            where: { slug },
        });

        if (existingProduct) {
            return NextResponse.json(
                { error: 'A product with this slug already exists' },
                { status: 400 }
            );
        }

        // Check featured products limit (max 3)
        if (isFeatured) {
            const featuredCount = await prisma.product.count({
                where: { isFeatured: true },
            });

            if (featuredCount >= 3) {
                return NextResponse.json(
                    {
                        error: 'Limite prodotti in evidenza raggiunto',
                        errorCode: 'FEATURED_LIMIT_EXCEEDED',
                        message: 'È possibile avere al massimo 3 prodotti in evidenza. Rimuovi un prodotto dalla vetrina prima di aggiungerne un altro.'
                    },
                    { status: 400 }
                );
            }
        }

        // Create product
        const product = await prisma.product.create({
            data: {
                title,
                titleEn: titleEn || null,
                slug,
                description,
                descriptionEn: descriptionEn || null,
                price,
                status: status || 'AVAILABLE',
                categoryId: categoryId || null,
                dimensions: dimensions || null,
                materials: materials || null,
                condition: condition || null,
                provenance: provenance || null,
                isFeatured: isFeatured || false,
                // Shipping overrides
                shippingCost: shippingCost ?? null,
                shippingCostIntl: shippingCostIntl ?? null,
                requiresSpecialShipping: requiresSpecialShipping || false,
                shippingNote: shippingNote || null,
                shippingNoteEn: shippingNoteEn || null,
            },
            include: {
                category: true,
            },
        });

        // Create images if provided
        if (images?.newImages && images.newImages.length > 0) {
            await prisma.productImage.createMany({
                data: images.newImages.map((img: { url: string; isPrimary: boolean; sortOrder: number }) => ({
                    productId: product.id,
                    url: img.url,
                    alt: title,
                    isPrimary: img.isPrimary,
                    sortOrder: img.sortOrder,
                })),
            });
        }

        // Fetch product with images
        const productWithImages = await prisma.product.findUnique({
            where: { id: product.id },
            include: {
                category: true,
                images: {
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });

        return NextResponse.json(productWithImages, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
}
