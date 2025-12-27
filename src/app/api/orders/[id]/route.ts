import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendOrderShippedEmail } from '@/emails';

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
        const {
            status,
            internalNotes,
            shippedAt,
            trackingNumber,
            carrierName,
            trackingUrl,
            sendNotification = true,
        } = body;

        // Check if order exists with full details for email
        const existingOrder = await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
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
                },
                user: true,
            },
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

        // Determine if we're shipping now
        const isShippingNow = status === 'SHIPPED' && existingOrder.status !== 'SHIPPED';
        const shippedAtDate = isShippingNow ? (shippedAt || new Date()) : existingOrder.shippedAt;

        // Build internal notes with tracking info if provided
        let updatedInternalNotes = internalNotes !== undefined ? internalNotes : existingOrder.internalNotes;
        if (isShippingNow && (trackingNumber || carrierName)) {
            const trackingInfo = [
                carrierName ? `Corriere: ${carrierName}` : null,
                trackingNumber ? `Tracking: ${trackingNumber}` : null,
                trackingUrl ? `Link: ${trackingUrl}` : null,
            ].filter(Boolean).join('\n');

            updatedInternalNotes = updatedInternalNotes
                ? `${updatedInternalNotes}\n\n--- Spedizione ${new Date().toLocaleDateString('it-IT')} ---\n${trackingInfo}`
                : `--- Spedizione ${new Date().toLocaleDateString('it-IT')} ---\n${trackingInfo}`;
        }

        // Update order
        const order = await prisma.order.update({
            where: { id },
            data: {
                status: status ?? existingOrder.status,
                internalNotes: updatedInternalNotes,
                shippedAt: shippedAtDate,
            },
            include: {
                items: {
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
                },
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

        // Send shipping notification email
        if (isShippingNow && sendNotification) {
            const customerEmail = existingOrder.shippingEmail || existingOrder.user?.email;

            if (customerEmail) {
                try {
                    await sendOrderShippedEmail({
                        to: customerEmail,
                        orderNumber: order.orderNumber,
                        customerName: existingOrder.shippingName || existingOrder.user?.name || 'Cliente',
                        items: order.items.map(item => ({
                            id: item.id,
                            productTitle: item.productTitle,
                            productSlug: item.productSlug,
                            price: Number(item.price),
                            quantity: item.quantity,
                            imageUrl: item.product.images[0]?.url,
                        })),
                        total: Number(order.total),
                        shippingAddress: existingOrder.shippingAddress ? {
                            name: existingOrder.shippingName || undefined,
                            address: existingOrder.shippingAddress,
                            city: existingOrder.shippingCity || undefined,
                            postal: existingOrder.shippingPostal || undefined,
                            country: existingOrder.shippingCountry || undefined,
                        } : undefined,
                        trackingNumber: trackingNumber || undefined,
                        trackingUrl: trackingUrl || undefined,
                        carrierName: carrierName || undefined,
                        shippedAt: new Date(shippedAtDate!),
                        locale: 'it', // Could be determined from user preferences
                    });
                    console.log(`Shipping notification sent to: ${customerEmail} for order: ${order.orderNumber}`);
                } catch (emailError) {
                    console.error('Failed to send shipping notification email:', emailError);
                    // Don't fail the request if email fails
                }
            }
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
