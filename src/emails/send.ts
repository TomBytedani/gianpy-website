/**
 * Email Sending Functions
 * High-level functions for sending specific email types
 */

import { sendEmail } from '@/lib/email';
import { OrderConfirmationEmail } from './OrderConfirmationEmail';
import { WishlistSoldEmail } from './WishlistSoldEmail';
import { BackInStockEmail } from './BackInStockEmail';
import { ContactFormReceiptEmail } from './ContactFormReceiptEmail';
import * as React from 'react';

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail({
    to,
    orderNumber,
    customerName,
    items,
    subtotal,
    shippingCost,
    total,
    shippingAddress,
    orderDate,
    locale = 'it',
}: {
    to: string;
    orderNumber: string;
    customerName: string;
    items: Array<{
        id: string;
        productTitle: string;
        productSlug: string;
        price: number | string;
        quantity: number;
        imageUrl?: string;
    }>;
    subtotal: number | string;
    shippingCost: number | string;
    total: number | string;
    shippingAddress?: {
        name?: string;
        address?: string;
        city?: string;
        postal?: string;
        country?: string;
    };
    orderDate: Date;
    locale?: 'it' | 'en';
}) {
    const subject = locale === 'it'
        ? `Conferma ordine ${orderNumber} - Antichità Barbaglia`
        : `Order Confirmation ${orderNumber} - Antichità Barbaglia`;

    return sendEmail({
        to,
        subject,
        react: React.createElement(OrderConfirmationEmail, {
            orderNumber,
            customerName,
            items,
            subtotal,
            shippingCost,
            total,
            shippingAddress,
            orderDate,
            locale,
        }),
    });
}

/**
 * Send wishlist item sold notification
 */
export async function sendWishlistSoldEmail({
    to,
    customerName,
    productTitle,
    productSlug,
    productPrice,
    productImageUrl,
    locale = 'it',
}: {
    to: string;
    customerName: string;
    productTitle: string;
    productSlug: string;
    productPrice: number | string;
    productImageUrl?: string;
    locale?: 'it' | 'en';
}) {
    const subject = locale === 'it'
        ? `Il tuo articolo "${productTitle}" è stato venduto`
        : `Your wishlist item "${productTitle}" has been sold`;

    return sendEmail({
        to,
        subject,
        react: React.createElement(WishlistSoldEmail, {
            customerName,
            productTitle,
            productSlug,
            productPrice,
            productImageUrl,
            locale,
        }),
    });
}

/**
 * Send back in stock notification
 */
export async function sendBackInStockEmail({
    to,
    customerName,
    productTitle,
    productSlug,
    productPrice,
    productImageUrl,
    locale = 'it',
}: {
    to: string;
    customerName: string;
    productTitle: string;
    productSlug: string;
    productPrice: number | string;
    productImageUrl?: string;
    locale?: 'it' | 'en';
}) {
    const subject = locale === 'it'
        ? `"${productTitle}" è di nuovo disponibile!`
        : `"${productTitle}" is back in stock!`;

    return sendEmail({
        to,
        subject,
        react: React.createElement(BackInStockEmail, {
            customerName,
            productTitle,
            productSlug,
            productPrice,
            productImageUrl,
            locale,
        }),
    });
}

/**
 * Send contact form receipt to the customer
 */
export async function sendContactFormReceiptEmail({
    to,
    customerName,
    subject: formSubject,
    message,
    locale = 'it',
}: {
    to: string;
    customerName: string;
    subject: string;
    message: string;
    locale?: 'it' | 'en';
}) {
    const emailSubject = locale === 'it'
        ? 'Abbiamo ricevuto il tuo messaggio - Antichità Barbaglia'
        : 'We received your message - Antichità Barbaglia';

    return sendEmail({
        to,
        subject: emailSubject,
        react: React.createElement(ContactFormReceiptEmail, {
            customerName,
            customerEmail: to,
            subject: formSubject,
            message,
            locale,
        }),
    });
}

/**
 * Send contact form notification to admin
 */
export async function sendContactFormAdminNotification({
    adminEmail,
    customerName,
    customerEmail,
    subject,
    message,
}: {
    adminEmail: string;
    customerName: string;
    customerEmail: string;
    subject: string;
    message: string;
}) {
    const emailSubject = `[Nuovo Messaggio] ${subject} - da ${customerName}`;

    return sendEmail({
        to: adminEmail,
        subject: emailSubject,
        text: `
Nuovo messaggio dal modulo di contatto

Da: ${customerName} <${customerEmail}>
Oggetto: ${subject}

Messaggio:
${message}

---
Rispondi direttamente a questa email per contattare il cliente.
        `.trim(),
    });
}
