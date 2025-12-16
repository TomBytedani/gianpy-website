import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = {
    params: Promise<{ id: string }>;
};

// GET /api/orders/[id] - Get a single order
export async function GET(req: NextRequest, context: RouteContext) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await context.params;

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: {
                                    orderBy: { sortOrder: 'asc' },
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

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Non-admin users can only view their own orders
        if (session.user.role !== 'ADMIN' && order.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order' },
            { status: 500 }
        );
    }
}

// PUT /api/orders/[id] - Update order status (admin only)
export async function PUT(req: NextRequest, context: RouteContext) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await context.params;
        const body = await req.json();
        const { status, internalNotes, shippedAt } = body;

        // Check if order exists
        const existingOrder = await prisma.order.findUnique({
            where: { id },
        });

        if (!existingOrder) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Validate status
        const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (status && !validStatuses.includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            );
        }

        // Update order
        const order = await prisma.order.update({
            where: { id },
            data: {
                status: status ?? existingOrder.status,
                internalNotes: internalNotes !== undefined ? internalNotes : existingOrder.internalNotes,
                shippedAt: status === 'SHIPPED' && !existingOrder.shippedAt
                    ? shippedAt || new Date()
                    : existingOrder.shippedAt,
            },
            include: {
                items: true,
            },
        });

        // If order is cancelled, restore product availability
        if (status === 'CANCELLED' && existingOrder.status !== 'CANCELLED') {
            const productIds = order.items.map(item => item.productId);
            await prisma.product.updateMany({
                where: {
                    id: { in: productIds },
                    status: 'SOLD',
                },
                data: {
                    status: 'AVAILABLE',
                    soldAt: null,
                },
            });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json(
            { error: 'Failed to update order' },
            { status: 500 }
        );
    }
}
