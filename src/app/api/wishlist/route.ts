import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/wishlist - Get user's wishlist
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const wishlistItems = await prisma.wishlistItem.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                product: {
                    include: {
                        images: {
                            where: { isPrimary: true },
                            take: 1,
                        },
                        category: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Transform the data for frontend consumption
        const items = wishlistItems.map((item) => ({
            id: item.id,
            productId: item.productId,
            createdAt: item.createdAt.toISOString(),
            notifyOnSale: item.notifyOnSale,
            notifyOnAvailable: item.notifyOnAvailable,
            notifyOnPriceChange: item.notifyOnPriceChange,
            product: {
                id: item.product.id,
                title: item.product.title,
                titleEn: item.product.titleEn,
                slug: item.product.slug,
                price: Number(item.product.price),
                status: item.product.status,
                categoryName: item.product.category?.displayName || null,
                categoryNameEn: item.product.category?.displayNameEn || null,
                imageUrl: item.product.images[0]?.url || null,
            },
        }));

        return NextResponse.json({ items });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        return NextResponse.json(
            { error: 'Failed to fetch wishlist' },
            { status: 500 }
        );
    }
}

// POST /api/wishlist - Add item to wishlist
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { productId, notifyOnSale = true, notifyOnPriceChange = false } = body;

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Reject SOLD items - they cannot be added to wishlist
        if (product.status === 'SOLD') {
            return NextResponse.json(
                {
                    error: 'This item has already been sold and is no longer available.',
                    errorCode: 'PRODUCT_SOLD'
                },
                { status: 400 }
            );
        }

        // Check if item already in wishlist
        const existingItem = await prisma.wishlistItem.findUnique({
            where: {
                userId_productId: {
                    userId: session.user.id,
                    productId,
                },
            },
        });

        if (existingItem) {
            return NextResponse.json(
                { error: 'Product already in wishlist', item: existingItem },
                { status: 409 }
            );
        }

        // Determine notification preferences based on product status
        // For COMING_SOON and RESERVED items, users want to be notified when available
        const shouldNotifyOnAvailable = product.status === 'COMING_SOON' || product.status === 'RESERVED';

        // Create wishlist item
        const wishlistItem = await prisma.wishlistItem.create({
            data: {
                userId: session.user.id,
                productId,
                notifyOnSale,
                notifyOnAvailable: shouldNotifyOnAvailable,
                notifyOnPriceChange,
            },
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

        return NextResponse.json({
            message: 'Added to wishlist',
            item: {
                id: wishlistItem.id,
                productId: wishlistItem.productId,
                createdAt: wishlistItem.createdAt.toISOString(),
                product: {
                    id: wishlistItem.product.id,
                    title: wishlistItem.product.title,
                    slug: wishlistItem.product.slug,
                    price: Number(wishlistItem.product.price),
                    status: wishlistItem.product.status,
                    imageUrl: wishlistItem.product.images[0]?.url || null,
                },
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        return NextResponse.json(
            { error: 'Failed to add to wishlist' },
            { status: 500 }
        );
    }
}
