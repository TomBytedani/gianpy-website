import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendBackInStockEmail, sendWishlistSoldEmail } from '@/emails';

type RouteContext = {
    params: Promise<{ id: string }>;
};

// GET /api/products/[id] - Get a single product
export async function GET(req: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;

        const product = await prisma.product.findUnique({
            where: { id },
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

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}

// PUT /api/products/[id] - Update a product (admin only)
export async function PUT(req: NextRequest, context: RouteContext) {
    try {
        // Check authentication
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await context.params;
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

        // Check if product exists
        const existingProduct = await prisma.product.findUnique({
            where: { id },
        });

        if (!existingProduct) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Check for slug conflict (if slug is being changed)
        if (slug && slug !== existingProduct.slug) {
            const slugConflict = await prisma.product.findUnique({
                where: { slug },
            });

            if (slugConflict) {
                return NextResponse.json(
                    { error: 'A product with this slug already exists' },
                    { status: 400 }
                );
            }
        }

        // Check featured products limit (max 3) only if setting to featured
        if (isFeatured && !existingProduct.isFeatured) {
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

        // Update product
        const product = await prisma.product.update({
            where: { id },
            data: {
                title: title ?? existingProduct.title,
                titleEn: titleEn !== undefined ? titleEn || null : existingProduct.titleEn,
                slug: slug ?? existingProduct.slug,
                description: description ?? existingProduct.description,
                descriptionEn: descriptionEn !== undefined ? descriptionEn || null : existingProduct.descriptionEn,
                price: price ?? existingProduct.price,
                status: status ?? existingProduct.status,
                categoryId: categoryId !== undefined ? categoryId || null : existingProduct.categoryId,
                dimensions: dimensions !== undefined ? dimensions || null : existingProduct.dimensions,
                materials: materials !== undefined ? materials || null : existingProduct.materials,
                condition: condition !== undefined ? condition || null : existingProduct.condition,
                provenance: provenance !== undefined ? provenance || null : existingProduct.provenance,
                isFeatured: isFeatured !== undefined ? isFeatured : existingProduct.isFeatured,
                // Shipping overrides
                shippingCost: shippingCost !== undefined ? shippingCost ?? null : existingProduct.shippingCost,
                shippingCostIntl: shippingCostIntl !== undefined ? shippingCostIntl ?? null : existingProduct.shippingCostIntl,
                requiresSpecialShipping: requiresSpecialShipping !== undefined ? requiresSpecialShipping : existingProduct.requiresSpecialShipping,
                shippingNote: shippingNote !== undefined ? shippingNote || null : existingProduct.shippingNote,
                shippingNoteEn: shippingNoteEn !== undefined ? shippingNoteEn || null : existingProduct.shippingNoteEn,
                // Update soldAt if status changes to SOLD
                soldAt: status === 'SOLD' && existingProduct.status !== 'SOLD' ? new Date() : existingProduct.soldAt,
            },
            include: {
                category: true,
            },
        });

        // Send notifications based on status changes
        const statusChanged = status && status !== existingProduct.status;

        if (statusChanged) {
            // Product became AVAILABLE (back in stock)
            if (status === 'AVAILABLE' && (existingProduct.status === 'SOLD' || existingProduct.status === 'COMING_SOON' || existingProduct.status === 'RESERVED')) {
                await notifyWishlistUsersBackInStock(id);
            }
            // Product became SOLD
            else if (status === 'SOLD') {
                await notifyWishlistUsersProductSold(id);
            }
        }

        // Handle image updates if provided
        if (images) {
            const { newImages, existingImages: updatedExistingImages, imagesToDelete } = images;

            // Delete removed images
            if (imagesToDelete && imagesToDelete.length > 0) {
                await prisma.productImage.deleteMany({
                    where: {
                        id: { in: imagesToDelete },
                        productId: id,
                    },
                });
            }

            // Update existing images (isPrimary, sortOrder)
            if (updatedExistingImages && updatedExistingImages.length > 0) {
                for (const img of updatedExistingImages) {
                    await prisma.productImage.update({
                        where: { id: img.id },
                        data: {
                            isPrimary: img.isPrimary,
                            sortOrder: img.sortOrder,
                        },
                    });
                }
            }

            // Create new images
            if (newImages && newImages.length > 0) {
                await prisma.productImage.createMany({
                    data: newImages.map((img: { url: string; isPrimary: boolean; sortOrder: number }) => ({
                        productId: id,
                        url: img.url,
                        alt: title || existingProduct.title,
                        isPrimary: img.isPrimary,
                        sortOrder: img.sortOrder,
                    })),
                });
            }
        }

        // Fetch updated product with images
        const updatedProduct = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                images: {
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        );
    }
}

/**
 * Notify wishlist users that a product is back in stock
 */
async function notifyWishlistUsersBackInStock(productId: string) {
    try {
        const wishlistItems = await prisma.wishlistItem.findMany({
            where: {
                productId,
                notifyOnAvailable: true,
                notifiedAvailable: false,
            },
            include: {
                user: true,
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

        console.log(`Found ${wishlistItems.length} wishlist users to notify about back in stock`);

        for (const item of wishlistItems) {
            const { user, product } = item;

            if (!user.email) continue;

            try {
                await sendBackInStockEmail({
                    to: user.email,
                    customerName: user.name || 'Cliente',
                    productTitle: product.title,
                    productSlug: product.slug,
                    productPrice: Number(product.price),
                    productImageUrl: product.images[0]?.url,
                    locale: 'it',
                });

                // Mark as notified and reset the flag for future notifications
                await prisma.wishlistItem.update({
                    where: { id: item.id },
                    data: {
                        notifiedAvailable: true,
                        notifiedSold: false, // Reset sold flag so they can be notified again if it sells
                    },
                });

                console.log(`Back in stock notification sent to: ${user.email} for product: ${product.title}`);
            } catch (emailError) {
                console.error(`Failed to send back in stock email to ${user.email}:`, emailError);
            }
        }
    } catch (error) {
        console.error('Error sending back in stock notifications:', error);
    }
}

/**
 * Notify wishlist users that a product has been sold
 */
async function notifyWishlistUsersProductSold(productId: string) {
    try {
        const wishlistItems = await prisma.wishlistItem.findMany({
            where: {
                productId,
                notifyOnSale: true,
                notifiedSold: false,
            },
            include: {
                user: true,
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

        console.log(`Found ${wishlistItems.length} wishlist users to notify about sold item`);

        for (const item of wishlistItems) {
            const { user, product } = item;

            if (!user.email) continue;

            try {
                await sendWishlistSoldEmail({
                    to: user.email,
                    customerName: user.name || 'Cliente',
                    productTitle: product.title,
                    productSlug: product.slug,
                    productPrice: Number(product.price),
                    productImageUrl: product.images[0]?.url,
                    locale: 'it',
                });

                // Mark as notified
                await prisma.wishlistItem.update({
                    where: { id: item.id },
                    data: {
                        notifiedSold: true,
                        notifiedAvailable: false, // Reset available flag for when it comes back
                    },
                });

                console.log(`Wishlist sold notification sent to: ${user.email} for product: ${product.title}`);
            } catch (emailError) {
                console.error(`Failed to send wishlist sold email to ${user.email}:`, emailError);
            }
        }
    } catch (error) {
        console.error('Error sending wishlist sold notifications:', error);
    }
}

// DELETE /api/products/[id] - Delete a product (admin only)
export async function DELETE(req: NextRequest, context: RouteContext) {
    try {
        // Check authentication
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await context.params;

        // Check if product exists
        const existingProduct = await prisma.product.findUnique({
            where: { id },
        });

        if (!existingProduct) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Check if product is part of any orders
        const orderItems = await prisma.orderItem.findMany({
            where: { productId: id },
        });

        if (orderItems.length > 0) {
            return NextResponse.json(
                { error: 'Cannot delete product that is part of existing orders. Consider marking it as sold instead.' },
                { status: 400 }
            );
        }

        // Delete product (cascades to images, tags, wishlist items)
        await prisma.product.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        );
    }
}
