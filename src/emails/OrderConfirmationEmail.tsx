/**
 * Order Confirmation Email Template
 * Sent after successful payment for an order
 */

import {
    Button,
    Column,
    Hr,
    Img,
    Row,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout, emailStyles } from './EmailLayout';
import { BASE_URL, formatDate, formatPrice } from '@/lib/email';

interface OrderItem {
    id: string;
    productTitle: string;
    productSlug: string;
    price: number | string;
    quantity: number;
    imageUrl?: string;
}

interface OrderConfirmationEmailProps {
    orderNumber: string;
    customerName: string;
    items: OrderItem[];
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
}

// Text content based on locale
const content = {
    it: {
        preview: (orderNumber: string) => `Conferma ordine ${orderNumber} - Antichità Barbaglia`,
        greeting: (name: string) => `Gentile ${name},`,
        thankYou: 'Grazie per il tuo acquisto!',
        orderConfirmed: 'Il tuo ordine è stato confermato e sarà elaborato a breve.',
        orderDetails: 'Dettagli Ordine',
        orderNumber: 'Numero Ordine',
        orderDate: 'Data Ordine',
        yourItems: 'I tuoi articoli',
        qty: 'Qtà',
        subtotal: 'Subtotale',
        shipping: 'Spedizione',
        total: 'Totale',
        shippingTo: 'Spedizione a',
        viewOrder: 'Visualizza Ordine',
        nextSteps: 'Prossimi passi',
        nextStepsText: 'Ti contatteremo presto per organizzare la spedizione del tuo pezzo. Dato che ogni articolo è unico e di valore, prendiamo particolare cura nell\'imballaggio e nella consegna.',
        questions: 'Hai domande?',
        questionsText: 'Non esitare a contattarci. Siamo qui per aiutarti.',
    },
    en: {
        preview: (orderNumber: string) => `Order Confirmation ${orderNumber} - Antichità Barbaglia`,
        greeting: (name: string) => `Dear ${name},`,
        thankYou: 'Thank you for your purchase!',
        orderConfirmed: 'Your order has been confirmed and will be processed shortly.',
        orderDetails: 'Order Details',
        orderNumber: 'Order Number',
        orderDate: 'Order Date',
        yourItems: 'Your Items',
        qty: 'Qty',
        subtotal: 'Subtotal',
        shipping: 'Shipping',
        total: 'Total',
        shippingTo: 'Shipping to',
        viewOrder: 'View Order',
        nextSteps: 'Next Steps',
        nextStepsText: 'We will contact you shortly to arrange the delivery of your piece. Since each item is unique and valuable, we take special care in packaging and delivery.',
        questions: 'Have questions?',
        questionsText: 'Feel free to reach out to us. We\'re here to help.',
    },
};

const itemRowStyle: React.CSSProperties = {
    borderBottom: `1px solid ${emailStyles.colors.border}`,
    padding: '16px 0',
};

const itemImageStyle: React.CSSProperties = {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '4px',
};

const itemTitleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: emailStyles.colors.text,
    margin: '0',
};

const itemPriceStyle: React.CSSProperties = {
    fontSize: '16px',
    color: emailStyles.colors.primary,
    fontWeight: 'bold',
    textAlign: 'right' as const,
};

const summaryRowStyle: React.CSSProperties = {
    padding: '8px 0',
};

const summaryLabelStyle: React.CSSProperties = {
    fontSize: '14px',
    color: emailStyles.colors.textMuted,
};

const summaryValueStyle: React.CSSProperties = {
    fontSize: '14px',
    color: emailStyles.colors.text,
    textAlign: 'right' as const,
};

const totalRowStyle: React.CSSProperties = {
    ...summaryRowStyle,
    borderTop: `2px solid ${emailStyles.colors.text}`,
    marginTop: '8px',
    paddingTop: '16px',
};

const totalLabelStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: emailStyles.colors.text,
};

const totalValueStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: emailStyles.colors.primary,
    textAlign: 'right' as const,
};

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
    orderNumber,
    customerName,
    items,
    subtotal,
    shippingCost,
    total,
    shippingAddress,
    orderDate,
    locale = 'it',
}) => {
    const t = content[locale];

    return (
        <EmailLayout preview={t.preview(orderNumber)} locale={locale}>
            {/* Greeting */}
            <Text style={emailStyles.paragraph}>
                {t.greeting(customerName || 'Cliente')}
            </Text>

            <Text style={emailStyles.heading}>
                {t.thankYou}
            </Text>

            <Text style={emailStyles.paragraph}>
                {t.orderConfirmed}
            </Text>

            <Hr style={emailStyles.hr} />

            {/* Order Info */}
            <Section>
                <Text style={{ ...emailStyles.heading, fontSize: '18px' }}>
                    {t.orderDetails}
                </Text>
                <Row>
                    <Column>
                        <Text style={emailStyles.muted}>{t.orderNumber}</Text>
                        <Text style={{ ...emailStyles.paragraph, fontWeight: 'bold', margin: '4px 0' }}>
                            {orderNumber}
                        </Text>
                    </Column>
                    <Column>
                        <Text style={emailStyles.muted}>{t.orderDate}</Text>
                        <Text style={{ ...emailStyles.paragraph, margin: '4px 0' }}>
                            {formatDate(orderDate, locale)}
                        </Text>
                    </Column>
                </Row>
            </Section>

            <Hr style={emailStyles.hr} />

            {/* Items */}
            <Section>
                <Text style={{ ...emailStyles.heading, fontSize: '18px' }}>
                    {t.yourItems}
                </Text>

                {items.map((item) => (
                    <Row key={item.id} style={itemRowStyle}>
                        <Column style={{ width: '80px' }}>
                            {item.imageUrl ? (
                                <Img
                                    src={item.imageUrl}
                                    alt={item.productTitle}
                                    style={itemImageStyle}
                                />
                            ) : (
                                <div style={{
                                    ...itemImageStyle,
                                    backgroundColor: emailStyles.colors.border,
                                }} />
                            )}
                        </Column>
                        <Column style={{ paddingLeft: '16px' }}>
                            <Text style={itemTitleStyle}>{item.productTitle}</Text>
                            <Text style={emailStyles.muted}>{t.qty}: {item.quantity}</Text>
                        </Column>
                        <Column style={{ width: '100px' }}>
                            <Text style={itemPriceStyle}>{formatPrice(item.price)}</Text>
                        </Column>
                    </Row>
                ))}

                {/* Order Summary */}
                <Section style={{ marginTop: '24px' }}>
                    <Row style={summaryRowStyle}>
                        <Column>
                            <Text style={summaryLabelStyle}>{t.subtotal}</Text>
                        </Column>
                        <Column>
                            <Text style={summaryValueStyle}>{formatPrice(subtotal)}</Text>
                        </Column>
                    </Row>
                    <Row style={summaryRowStyle}>
                        <Column>
                            <Text style={summaryLabelStyle}>{t.shipping}</Text>
                        </Column>
                        <Column>
                            <Text style={summaryValueStyle}>
                                {parseFloat(String(shippingCost)) === 0
                                    ? (locale === 'it' ? 'Da definire' : 'TBD')
                                    : formatPrice(shippingCost)
                                }
                            </Text>
                        </Column>
                    </Row>
                    <Row style={totalRowStyle}>
                        <Column>
                            <Text style={totalLabelStyle}>{t.total}</Text>
                        </Column>
                        <Column>
                            <Text style={totalValueStyle}>{formatPrice(total)}</Text>
                        </Column>
                    </Row>
                </Section>
            </Section>

            {/* Shipping Address */}
            {shippingAddress && (
                <>
                    <Hr style={emailStyles.hr} />
                    <Section>
                        <Text style={{ ...emailStyles.heading, fontSize: '18px' }}>
                            {t.shippingTo}
                        </Text>
                        <Text style={emailStyles.paragraph}>
                            {shippingAddress.name && <>{shippingAddress.name}<br /></>}
                            {shippingAddress.address && <>{shippingAddress.address}<br /></>}
                            {shippingAddress.postal && shippingAddress.city && (
                                <>{shippingAddress.postal} {shippingAddress.city}<br /></>
                            )}
                            {shippingAddress.country}
                        </Text>
                    </Section>
                </>
            )}

            <Hr style={emailStyles.hr} />

            {/* CTA Button */}
            <Section style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
                <Button
                    href={`${BASE_URL}/account/orders`}
                    style={emailStyles.button}
                >
                    {t.viewOrder}
                </Button>
            </Section>

            <Hr style={emailStyles.hr} />

            {/* Next Steps */}
            <Section>
                <Text style={{ ...emailStyles.heading, fontSize: '18px' }}>
                    {t.nextSteps}
                </Text>
                <Text style={emailStyles.paragraph}>
                    {t.nextStepsText}
                </Text>
            </Section>

            {/* Questions */}
            <Section>
                <Text style={{ ...emailStyles.heading, fontSize: '18px' }}>
                    {t.questions}
                </Text>
                <Text style={emailStyles.paragraph}>
                    {t.questionsText}
                </Text>
            </Section>
        </EmailLayout>
    );
};

export default OrderConfirmationEmail;
