import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { constructWebhookEvent, getCheckoutSession } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail, sendWishlistSoldEmail, sendAdminNewOrderEmail } from '@/emails';

// Order number generator - creates a unique order number
function generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `AB-${timestamp}-${random}`;
}

export async function POST(req: NextRequest) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('Missing STRIPE_WEBHOOK_SECRET');
        return NextResponse.json(
            { error: 'Webhook secret not configured' },
            { status: 500 }
        );
    }

    try {
        // Get raw body as text
        const body = await req.text();
        const signature = req.headers.get('stripe-signature');

        if (!signature) {
            return NextResponse.json(
                { error: 'Missing stripe-signature header' },
                { status: 400 }
            );
        }

        // Verify webhook signature and construct event
        let event: Stripe.Event;
        try {
            event = constructWebhookEvent(body, signature, webhookSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err);
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            );
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutSessionCompleted(session);
                break;
            }

            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                await handlePaymentIntentSucceeded(paymentIntent);
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                await handlePaymentIntentFailed(paymentIntent);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}

/**
 * Handle successful checkout session
 * Creates an order in the database
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    console.log('Processing checkout.session.completed:', session.id);

    // Already have an order for this session?
    const existingOrder = await prisma.order.findFirst({
        where: { stripeSessionId: session.id },
    });

    if (existingOrder) {
        console.log('Order already exists for session:', session.id);
        return;
    }

    // Get full session details with line items
    const fullSession = await getCheckoutSession(session.id);

    // Extract user ID from metadata
    const userId = session.metadata?.userId;
    const productIds = session.metadata?.productIds?.split(',') || [];

    // Get shipping details from the session
    // Note: shipping_details is available on the session after checkout completes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionAny = fullSession as any;
    const shippingDetails = sessionAny.shipping_details || sessionAny.collected_information?.shipping_details;
    const customerDetails = fullSession.customer_details;

    // Calculate totals
    const amountTotal = (fullSession.amount_total || 0) / 100; // Convert from cents
    const amountSubtotal = (fullSession.amount_subtotal || 0) / 100;
    const shippingAmount = (fullSession.shipping_cost?.amount_total || 0) / 100;

    // Create the order
    const order = await prisma.order.create({
        data: {
            orderNumber: generateOrderNumber(),
            status: 'PAID',
            subtotal: amountSubtotal,
            shippingCost: shippingAmount,
            total: amountTotal,
            stripeSessionId: session.id,
            stripePaymentIntentId: typeof session.payment_intent === 'string'
                ? session.payment_intent
                : session.payment_intent?.id,

            // Customer info
            shippingName: shippingDetails?.name || customerDetails?.name,
            shippingEmail: customerDetails?.email,
            shippingPhone: customerDetails?.phone,

            // Shipping address
            shippingAddress: shippingDetails?.address?.line1
                ? `${shippingDetails.address.line1}${shippingDetails.address.line2 ? ', ' + shippingDetails.address.line2 : ''}`
                : null,
            shippingCity: shippingDetails?.address?.city,
            shippingPostal: shippingDetails?.address?.postal_code,
            shippingCountry: shippingDetails?.address?.country,

            // Timestamps
            paidAt: new Date(),

            // User relation (if logged in)
            userId: userId && userId !== 'guest' ? userId : null,

            // Create order items
            items: {
                create: await Promise.all(
                    productIds.map(async (productId) => {
                        const product = await prisma.product.findUnique({
                            where: { id: productId },
                        });

                        return {
                            productId,
                            quantity: 1,
                            price: product?.price || 0,
                            productTitle: product?.title || 'Unknown Product',
                            productSlug: product?.slug || productId,
                        };
                    })
                ),
            },
        },
    });

    console.log('Order created:', order.orderNumber);

    // Mark products as sold
    await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: {
            status: 'SOLD',
            soldAt: new Date(),
        },
    });

    console.log('Products marked as sold:', productIds);

    // Send order confirmation email
    if (customerDetails?.email) {
        try {
            // Fetch order items with product images for email
            const orderWithItems = await prisma.order.findUnique({
                where: { id: order.id },
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

            if (orderWithItems) {
                await sendOrderConfirmationEmail({
                    to: customerDetails.email,
                    orderNumber: order.orderNumber,
                    customerName: shippingDetails?.name || customerDetails.name || 'Cliente',
                    items: orderWithItems.items.map(item => ({
                        id: item.id,
                        productTitle: item.productTitle,
                        productSlug: item.productSlug,
                        price: Number(item.price),
                        quantity: item.quantity,
                        imageUrl: item.product.images[0]?.url,
                    })),
                    subtotal: Number(order.subtotal),
                    shippingCost: Number(order.shippingCost),
                    total: Number(order.total),
                    shippingAddress: shippingDetails?.address ? {
                        name: shippingDetails.name,
                        address: shippingDetails.address.line1,
                        city: shippingDetails.address.city,
                        postal: shippingDetails.address.postal_code,
                        country: shippingDetails.address.country,
                    } : undefined,
                    orderDate: order.createdAt,
                    locale: 'it', // Default to Italian, could be based on user preference
                });
                console.log('Order confirmation email sent to:', customerDetails.email);
            }
        } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
            // Don't fail the webhook if email fails
        }
    }

    // Send wishlist sold notifications
    await notifyWishlistUsersProductSold(productIds);

    // Send admin notification email
    await notifyAdminNewOrder({
        order,
        customerDetails,
        shippingDetails,
        userId,
    });
}

/**
 * Notify wishlist users that a product has been sold
 */
async function notifyWishlistUsersProductSold(productIds: string[]) {
    try {
        // Find all wishlist items for these products that haven't been notified yet
        const wishlistItems = await prisma.wishlistItem.findMany({
            where: {
                productId: { in: productIds },
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

        console.log(`Found ${wishlistItems.length} wishlist users to notify about sold items`);

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
                    locale: 'it', // Could be based on user preference
                });

                // Mark as notified
                await prisma.wishlistItem.update({
                    where: { id: item.id },
                    data: { notifiedSold: true },
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

/**
 * Handle successful payment intent
 * This is a backup handler in case checkout.session.completed wasn't processed
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    console.log('Processing payment_intent.succeeded:', paymentIntent.id);

    // Update order status if it exists
    const order = await prisma.order.findFirst({
        where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (order && order.status === 'PENDING') {
        await prisma.order.update({
            where: { id: order.id },
            data: {
                status: 'PAID',
                paidAt: new Date(),
            },
        });
        console.log('Order updated to PAID:', order.orderNumber);
    }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    console.log('Processing payment_intent.payment_failed:', paymentIntent.id);

    const order = await prisma.order.findFirst({
        where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (order) {
        await prisma.order.update({
            where: { id: order.id },
            data: {
                status: 'CANCELLED',
                internalNotes: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
            },
        });
        console.log('Order cancelled due to payment failure:', order.orderNumber);

        // Restore product availability
        const orderItems = await prisma.orderItem.findMany({
            where: { orderId: order.id },
        });

        await prisma.product.updateMany({
            where: { id: { in: orderItems.map(item => item.productId) } },
            data: {
                status: 'AVAILABLE',
                soldAt: null,
            },
        });
    }
}

/**
 * Notify admin about a new order
 */
async function notifyAdminNewOrder({
    order,
    customerDetails,
    shippingDetails,
    userId,
}: {
    order: {
        id: string;
        orderNumber: string;
        subtotal: unknown;
        shippingCost: unknown;
        total: unknown;
        createdAt: Date;
    };
    customerDetails: {
        email?: string | null;
        name?: string | null;
        phone?: string | null;
    } | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    shippingDetails: any;
    userId: string | undefined;
}) {
    try {
        // Get admin email from site settings
        const siteSettings = await prisma.siteSettings.findUnique({
            where: { id: 'default' },
        });

        const adminEmail = siteSettings?.contactFormNotificationEmail || process.env.ADMIN_EMAIL;

        if (!adminEmail) {
            console.log('No admin email configured, skipping admin notification');
            return;
        }

        // Fetch order with items for email
        const orderWithItems = await prisma.order.findUnique({
            where: { id: order.id },
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

        if (!orderWithItems) {
            console.error('Order not found for admin notification:', order.id);
            return;
        }

        const isGuest = !userId || userId === 'guest';

        await sendAdminNewOrderEmail({
            adminEmail,
            orderNumber: order.orderNumber,
            customerName: shippingDetails?.name || customerDetails?.name || 'Cliente',
            customerEmail: customerDetails?.email || 'N/A',
            customerPhone: customerDetails?.phone || shippingDetails?.phone || undefined,
            items: orderWithItems.items.map(item => ({
                id: item.id,
                productTitle: item.productTitle,
                productSlug: item.productSlug,
                price: Number(item.price),
                quantity: item.quantity,
                imageUrl: item.product.images[0]?.url,
            })),
            subtotal: Number(order.subtotal),
            shippingCost: Number(order.shippingCost),
            total: Number(order.total),
            shippingAddress: shippingDetails?.address ? {
                name: shippingDetails.name,
                address: shippingDetails.address.line1,
                city: shippingDetails.address.city,
                postal: shippingDetails.address.postal_code,
                country: shippingDetails.address.country,
            } : undefined,
            orderDate: order.createdAt,
            isGuest,
        });

        console.log(`Admin notification sent to: ${adminEmail} for order: ${order.orderNumber}`);
    } catch (error) {
        console.error('Failed to send admin notification:', error);
        // Don't fail the webhook if email fails
    }
}
