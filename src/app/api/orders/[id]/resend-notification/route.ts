import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendOrderShippedEmail } from '@/emails';

type RouteContext = {
    params: Promise<{ id: string }>;
};

// POST /api/orders/[id]/resend-notification - Resend shipping notification email
export async function POST(req: NextRequest, context: RouteContext) {
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
            trackingNumber,
            carrierName,
            trackingUrl,
            updateTracking = false, // If true, update the order notes with new tracking info
        } = body;

        // Fetch order with full details for email
        const order = await prisma.order.findUnique({
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

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Only allow resending for SHIPPED or DELIVERED orders
        if (order.status !== 'SHIPPED' && order.status !== 'DELIVERED') {
            return NextResponse.json(
                { error: 'Can only resend shipping notification for shipped or delivered orders' },
                { status: 400 }
            );
        }

        // Get customer email
        const customerEmail = order.shippingEmail || order.user?.email;

        if (!customerEmail) {
            return NextResponse.json(
                { error: 'No customer email found for this order' },
                { status: 400 }
            );
        }

        // If updateTracking is true, update the order's internal notes with new tracking info
        if (updateTracking && (trackingNumber || carrierName || trackingUrl)) {
            const trackingInfo = [
                carrierName ? `Corriere: ${carrierName}` : null,
                trackingNumber ? `Tracking: ${trackingNumber}` : null,
                trackingUrl ? `Link: ${trackingUrl}` : null,
            ].filter(Boolean).join('\n');

            const updatedInternalNotes = order.internalNotes
                ? `${order.internalNotes}\n\n--- Aggiornamento Tracking ${new Date().toLocaleDateString('it-IT')} ---\n${trackingInfo}`
                : `--- Aggiornamento Tracking ${new Date().toLocaleDateString('it-IT')} ---\n${trackingInfo}`;

            await prisma.order.update({
                where: { id },
                data: {
                    internalNotes: updatedInternalNotes,
                },
            });
        }

        // Send the shipping notification email
        await sendOrderShippedEmail({
            to: customerEmail,
            orderNumber: order.orderNumber,
            customerName: order.shippingName || order.user?.name || 'Cliente',
            items: order.items.map(item => ({
                id: item.id,
                productTitle: item.productTitle,
                productSlug: item.productSlug,
                price: Number(item.price),
                quantity: item.quantity,
                imageUrl: item.product.images[0]?.url,
            })),
            total: Number(order.total),
            shippingAddress: order.shippingAddress ? {
                name: order.shippingName || undefined,
                address: order.shippingAddress,
                city: order.shippingCity || undefined,
                postal: order.shippingPostal || undefined,
                country: order.shippingCountry || undefined,
            } : undefined,
            trackingNumber: trackingNumber || undefined,
            trackingUrl: trackingUrl || undefined,
            carrierName: carrierName || undefined,
            shippedAt: order.shippedAt || new Date(),
            locale: 'it',
        });

        console.log(`Shipping notification resent to: ${customerEmail} for order: ${order.orderNumber}`);

        return NextResponse.json({
            success: true,
            message: `Shipping notification resent to ${customerEmail}`,
        });
    } catch (error) {
        console.error('Error resending shipping notification:', error);
        return NextResponse.json(
            { error: 'Failed to resend shipping notification' },
            { status: 500 }
        );
    }
}
