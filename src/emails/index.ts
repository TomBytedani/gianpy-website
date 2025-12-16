/**
 * Email Templates Index
 * Export all email templates and sending functions
 */

// Email Templates
export { EmailLayout, emailStyles } from './EmailLayout';
export { OrderConfirmationEmail } from './OrderConfirmationEmail';
export { WishlistSoldEmail } from './WishlistSoldEmail';
export { BackInStockEmail } from './BackInStockEmail';
export { ContactFormReceiptEmail } from './ContactFormReceiptEmail';

// Email Sending Functions
export * from './send';
