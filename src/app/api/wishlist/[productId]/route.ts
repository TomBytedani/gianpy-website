import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE /api/wishlist/[productId] - Remove item from wishlist
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { productId } = await params;

        // Find and delete the wishlist item
        const wishlistItem = await prisma.wishlistItem.findUnique({
            where: {
                userId_productId: {
                    userId: session.user.id,
                    productId,
                },
            },
        });

        if (!wishlistItem) {
            return NextResponse.json(
                { error: 'Item not found in wishlist' },
                { status: 404 }
            );
        }

        await prisma.wishlistItem.delete({
            where: {
                id: wishlistItem.id,
            },
        });

        return NextResponse.json({ message: 'Removed from wishlist' });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return NextResponse.json(
            { error: 'Failed to remove from wishlist' },
            { status: 500 }
        );
    }
}

// GET /api/wishlist/[productId] - Check if product is in wishlist
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ inWishlist: false });
        }

        const { productId } = await params;

        const wishlistItem = await prisma.wishlistItem.findUnique({
            where: {
                userId_productId: {
                    userId: session.user.id,
                    productId,
                },
            },
        });

        return NextResponse.json({
            inWishlist: !!wishlistItem,
            itemId: wishlistItem?.id || null,
        });
    } catch (error) {
        console.error('Error checking wishlist:', error);
        return NextResponse.json(
            { error: 'Failed to check wishlist' },
            { status: 500 }
        );
    }
}
