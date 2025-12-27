/**
 * Order Shipped Email Template
 * Sent when admin marks an order as shipped/in transit
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
import { BASE_URL, formatPrice, formatDate } from '@/lib/email';

interface OrderItem {
    id: string;
    productTitle: string;
    productSlug: string;
    price: number | string;
    quantity: number;
    imageUrl?: string;
}

interface OrderShippedEmailProps {
    orderNumber: string;
    customerName: string;
    items: OrderItem[];
    total: number | string;
    shippingAddress?: {
        name?: string;
        address?: string;
        city?: string;
        postal?: string;
        country?: string;
    };
    trackingNumber?: string;
    trackingUrl?: string;
    carrierName?: string;
    shippedAt: Date;
    locale?: 'it' | 'en';
}

const content = {
    it: {
        preview: (orderNumber: string) => `Il tuo ordine ${orderNumber} è stato spedito!`,
        greeting: (name: string) => `Gentile ${name},`,
        title: 'Il tuo ordine è in viaggio!',
        message: 'Siamo lieti di informarti che il tuo ordine è stato spedito e sta viaggiando verso di te.',
        orderNumber: 'Numero Ordine',
        shippedDate: 'Data Spedizione',
        trackingInfo: 'Informazioni di Tracciamento',
        trackingNumber: 'Numero di Tracciamento',
        carrier: 'Corriere',
        trackOrder: 'Traccia il tuo Ordine',
        deliveryAddress: 'Indirizzo di Consegna',
        orderSummary: 'Riepilogo Ordine',
        total: 'Totale',
        estimatedDelivery: 'La consegna è prevista entro 3-5 giorni lavorativi.',
        questions: 'Hai domande?',
        questionsText: 'Non esitare a contattarci. Siamo qui per aiutarti.',
        contactUs: 'Contattaci',
        viewOrder: 'Visualizza Ordine',
    },
    en: {
        preview: (orderNumber: string) => `Your order ${orderNumber} has been shipped!`,
        greeting: (name: string) => `Dear ${name},`,
        title: 'Your order is on its way!',
        message: 'We are pleased to inform you that your order has been shipped and is on its way to you.',
        orderNumber: 'Order Number',
        shippedDate: 'Shipped Date',
        trackingInfo: 'Tracking Information',
        trackingNumber: 'Tracking Number',
        carrier: 'Carrier',
        trackOrder: 'Track your Order',
        deliveryAddress: 'Delivery Address',
        orderSummary: 'Order Summary',
        total: 'Total',
        estimatedDelivery: 'Delivery is expected within 3-5 business days.',
        questions: 'Have questions?',
        questionsText: 'Don\'t hesitate to contact us. We\'re here to help.',
        contactUs: 'Contact Us',
        viewOrder: 'View Order',
    },
};

const infoBoxStyle: React.CSSProperties = {
    backgroundColor: '#f0fdf4',
    border: '1px solid #86efac',
    borderRadius: '8px',
    padding: '20px',
    marginTop: '24px',
    marginBottom: '24px',
};

const trackingBoxStyle: React.CSSProperties = {
    backgroundColor: emailStyles.colors.background,
    border: `1px solid ${emailStyles.colors.border}`,
    borderRadius: '8px',
    padding: '20px',
    marginTop: '24px',
    marginBottom: '24px',
};

const itemRowStyle: React.CSSProperties = {
    borderBottom: `1px solid ${emailStyles.colors.border}`,
    padding: '16px 0',
};

const productImageStyle: React.CSSProperties = {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '4px',
};

export const OrderShippedEmail: React.FC<OrderShippedEmailProps> = ({
    orderNumber,
    customerName,
    items,
    total,
    shippingAddress,
    trackingNumber,
    trackingUrl,
    carrierName,
    shippedAt,
    locale = 'it',
}) => {
    const t = content[locale];

    return (
        <EmailLayout preview={t.preview(orderNumber)} locale={locale}>
            {/* Greeting */}
            <Text style={emailStyles.paragraph}>
                {t.greeting(customerName || 'Cliente')}
            </Text>

            {/* Success Banner */}
            <Section style={infoBoxStyle}>
                <Text style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#16a34a',
                    margin: '0 0 8px 0',
                    textAlign: 'center' as const,
                }}>
                    🚚 {t.title}
                </Text>
                <Text style={{
                    fontSize: '14px',
                    color: '#166534',
                    margin: '0',
                    textAlign: 'center' as const,
                }}>
                    {t.message}
                </Text>
            </Section>

            {/* Order Info */}
            <Section>
                <Row>
                    <Column style={{ width: '50%' }}>
                        <Text style={{
                            fontSize: '12px',
                            color: emailStyles.colors.textMuted,
                            margin: '0',
                            textTransform: 'uppercase' as const,
                        }}>
                            {t.orderNumber}
                        </Text>
                        <Text style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: emailStyles.colors.primary,
                            margin: '4px 0 0 0',
                        }}>
                            #{orderNumber}
                        </Text>
                    </Column>
                    <Column style={{ width: '50%', textAlign: 'right' as const }}>
                        <Text style={{
                            fontSize: '12px',
                            color: emailStyles.colors.textMuted,
                            margin: '0',
                            textTransform: 'uppercase' as const,
                        }}>
                            {t.shippedDate}
                        </Text>
                        <Text style={{
                            fontSize: '16px',
                            color: emailStyles.colors.text,
                            margin: '4px 0 0 0',
                        }}>
                            {formatDate(shippedAt, locale)}
                        </Text>
                    </Column>
                </Row>
            </Section>

            {/* Tracking Info (if available) */}
            {(trackingNumber || carrierName) && (
                <Section style={trackingBoxStyle}>
                    <Text style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: emailStyles.colors.text,
                        margin: '0 0 16px 0',
                    }}>
                        📦 {t.trackingInfo}
                    </Text>

                    {carrierName && (
                        <Row style={{ marginBottom: '8px' }}>
                            <Column style={{ width: '40%' }}>
                                <Text style={{
                                    fontSize: '14px',
                                    color: emailStyles.colors.textMuted,
                                    margin: '0',
                                }}>
                                    {t.carrier}:
                                </Text>
                            </Column>
                            <Column style={{ width: '60%' }}>
                                <Text style={{
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    color: emailStyles.colors.text,
                                    margin: '0',
                                }}>
                                    {carrierName}
                                </Text>
                            </Column>
                        </Row>
                    )}

                    {trackingNumber && (
                        <Row>
                            <Column style={{ width: '40%' }}>
                                <Text style={{
                                    fontSize: '14px',
                                    color: emailStyles.colors.textMuted,
                                    margin: '0',
                                }}>
                                    {t.trackingNumber}:
                                </Text>
                            </Column>
                            <Column style={{ width: '60%' }}>
                                <Text style={{
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    color: emailStyles.colors.primary,
                                    margin: '0',
                                    fontFamily: 'monospace',
                                }}>
                                    {trackingNumber}
                                </Text>
                            </Column>
                        </Row>
                    )}

                    {trackingUrl && (
                        <Section style={{ textAlign: 'center', marginTop: '16px' }}>
                            <Button
                                href={trackingUrl}
                                style={emailStyles.button}
                            >
                                {t.trackOrder}
                            </Button>
                        </Section>
                    )}
                </Section>
            )}

            {/* Estimated Delivery */}
            <Text style={{
                ...emailStyles.paragraph,
                textAlign: 'center' as const,
                fontStyle: 'italic',
            }}>
                {t.estimatedDelivery}
            </Text>

            <Hr style={emailStyles.hr} />

            {/* Delivery Address */}
            {shippingAddress && (
                <>
                    <Text style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: emailStyles.colors.text,
                        margin: '0 0 12px 0',
                    }}>
                        📍 {t.deliveryAddress}
                    </Text>
                    <Text style={{
                        ...emailStyles.paragraph,
                        margin: '0 0 24px 0',
                    }}>
                        {shippingAddress.name}<br />
                        {shippingAddress.address}<br />
                        {shippingAddress.postal} {shippingAddress.city}<br />
                        {shippingAddress.country}
                    </Text>
                </>
            )}

            {/* Order Items Summary */}
            <Text style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: emailStyles.colors.text,
                margin: '0 0 16px 0',
            }}>
                {t.orderSummary}
            </Text>

            {items.map((item, index) => (
                <Section key={item.id} style={index < items.length - 1 ? itemRowStyle : { padding: '16px 0' }}>
                    <Row>
                        <Column style={{ width: '60px' }}>
                            {item.imageUrl ? (
                                <Img
                                    src={item.imageUrl}
                                    alt={item.productTitle}
                                    style={productImageStyle}
                                />
                            ) : (
                                <div style={{
                                    ...productImageStyle,
                                    backgroundColor: emailStyles.colors.border,
                                }} />
                            )}
                        </Column>
                        <Column style={{ paddingLeft: '16px', verticalAlign: 'top' }}>
                            <Text style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: emailStyles.colors.text,
                                margin: '0',
                            }}>
                                {item.productTitle}
                            </Text>
                            <Text style={{
                                fontSize: '14px',
                                color: emailStyles.colors.primary,
                                fontWeight: 'bold',
                                margin: '4px 0 0 0',
                            }}>
                                {formatPrice(item.price)}
                            </Text>
                        </Column>
                    </Row>
                </Section>
            ))}

            {/* Total */}
            <Section style={{
                borderTop: `2px solid ${emailStyles.colors.border}`,
                paddingTop: '16px',
                marginTop: '8px',
            }}>
                <Row>
                    <Column style={{ width: '50%' }}>
                        <Text style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: emailStyles.colors.text,
                            margin: '0',
                        }}>
                            {t.total}
                        </Text>
                    </Column>
                    <Column style={{ width: '50%', textAlign: 'right' as const }}>
                        <Text style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: emailStyles.colors.primary,
                            margin: '0',
                        }}>
                            {formatPrice(total)}
                        </Text>
                    </Column>
                </Row>
            </Section>

            <Hr style={emailStyles.hr} />

            {/* Questions Section */}
            <Text style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: emailStyles.colors.text,
                margin: '0 0 8px 0',
            }}>
                {t.questions}
            </Text>
            <Text style={emailStyles.paragraph}>
                {t.questionsText}
            </Text>

            <Section style={{ textAlign: 'center', marginTop: '24px', marginBottom: '32px' }}>
                <Button
                    href={`${BASE_URL}/contact`}
                    style={{
                        ...emailStyles.button,
                        backgroundColor: 'transparent',
                        color: emailStyles.colors.primary,
                        border: `2px solid ${emailStyles.colors.primary}`,
                    }}
                >
                    {t.contactUs}
                </Button>
            </Section>
        </EmailLayout>
    );
};

export default OrderShippedEmail;
