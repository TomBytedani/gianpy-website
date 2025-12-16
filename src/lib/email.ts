/**
 * Email Service Configuration using Resend
 * 
 * This module provides functions for sending transactional emails
 * including order confirmations, wishlist notifications, and contact form receipts.
 */

import { Resend } from 'resend';

// Initialize Resend client
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
    console.warn('RESEND_API_KEY is not set. Email functionality will be disabled.');
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Default sender email
export const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@barbaglia-restauri.it';
export const EMAIL_FROM_NAME = "Antichità Barbaglia";
export const EMAIL_FROM_FULL = `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`;

// Base URL for links in emails
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/**
 * Send an email using Resend
 */
export async function sendEmail({
    to,
    subject,
    react,
    text,
}: {
    to: string | string[];
    subject: string;
    react?: React.ReactElement;
    text?: string;
}) {
    if (!resend) {
        console.warn('Email service not configured. Skipping email to:', to);
        return { success: false, error: 'Email service not configured' };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: EMAIL_FROM_FULL,
            to: Array.isArray(to) ? to : [to],
            subject,
            react,
            text,
        });

        if (error) {
            console.error('Error sending email:', error);
            return { success: false, error };
        }

        console.log('Email sent successfully:', data?.id);
        return { success: true, data };
    } catch (err) {
        console.error('Failed to send email:', err);
        return { success: false, error: err };
    }
}

/**
 * Format price for display in emails
 */
export function formatPrice(price: number | string): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR',
    }).format(numPrice);
}

/**
 * Format date for display in emails
 */
export function formatDate(date: Date, locale: 'it' | 'en' = 'it'): string {
    return new Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
}
