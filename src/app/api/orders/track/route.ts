import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/orders/track - Look up order by order number and email (public endpoint)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderNumber, email } = body;

        if (!orderNumber || !email) {
            return NextResponse.json(
                { error: 'Order number and email are required' },
                { status: 400 }
            );
        }

        // Normalize inputs
        const normalizedOrderNumber = orderNumber.trim().toUpperCase();
        const normalizedEmail = email.trim().toLowerCase();

        // Find order by order number
        const order = await prisma.order.findFirst({
            where: {
                orderNumber: {
                    equals: normalizedOrderNumber,
                    mode: 'insensitive',
                },
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
                user: {
                    select: {
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

        // Verify email matches (shipping email or user email)
        const orderEmail = (order.shippingEmail || order.user?.email || '').toLowerCase();

        if (orderEmail !== normalizedEmail) {
            // Don't reveal that the order exists but email doesn't match
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Return sanitized order data (exclude internal notes and sensitive info)
        return NextResponse.json({
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                subtotal: Number(order.subtotal),
                shippingCost: Number(order.shippingCost),
                tax: Number(order.tax),
                total: Number(order.total),
                shippingName: order.shippingName,
                shippingAddress: order.shippingAddress,
                shippingCity: order.shippingCity,
                shippingPostal: order.shippingPostal,
                shippingCountry: order.shippingCountry,
                createdAt: order.createdAt,
                paidAt: order.paidAt,
                shippedAt: order.shippedAt,
                items: order.items.map(item => ({
                    id: item.id,
                    productTitle: item.productTitle,
                    productSlug: item.productSlug,
                    price: Number(item.price),
                    quantity: item.quantity,
                    imageUrl: item.product.images[0]?.url,
                })),
            },
        });
    } catch (error) {
        console.error('Error tracking order:', error);
        return NextResponse.json(
            { error: 'Failed to track order' },
            { status: 500 }
        );
    }
}
