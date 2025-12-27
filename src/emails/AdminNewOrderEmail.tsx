/**
 * Admin New Order Notification Email Template
 * Sent to admin when a new order is placed
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

interface AdminNewOrderEmailProps {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
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
    isGuest: boolean;
}

const alertBoxStyle: React.CSSProperties = {
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '8px',
    padding: '20px',
    marginTop: '24px',
    marginBottom: '24px',
    textAlign: 'center' as const,
};

const infoBoxStyle: React.CSSProperties = {
    backgroundColor: emailStyles.colors.background,
    border: `1px solid ${emailStyles.colors.border}`,
    borderRadius: '8px',
    padding: '16px',
    marginTop: '16px',
    marginBottom: '16px',
};

const itemRowStyle: React.CSSProperties = {
    borderBottom: `1px solid ${emailStyles.colors.border}`,
    padding: '12px 0',
};

const productImageStyle: React.CSSProperties = {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '4px',
};

const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: emailStyles.colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    margin: '0 0 4px 0',
};

const valueStyle: React.CSSProperties = {
    fontSize: '14px',
    color: emailStyles.colors.text,
    fontWeight: 'bold',
    margin: '0',
};

export const AdminNewOrderEmail: React.FC<AdminNewOrderEmailProps> = ({
    orderNumber,
    customerName,
    customerEmail,
    customerPhone,
    items,
    subtotal,
    shippingCost,
    total,
    shippingAddress,
    orderDate,
    isGuest,
}) => {
    const preview = `🎉 Nuovo ordine #${orderNumber} - €${Number(total).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`;

    return (
        <EmailLayout preview={preview} locale="it">
            {/* Alert Banner */}
            <Section style={alertBoxStyle}>
                <Text style={{
                    fontSize: '28px',
                    margin: '0 0 8px 0',
                }}>
                    🎉
                </Text>
                <Text style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#92400e',
                    margin: '0 0 4px 0',
                }}>
                    Nuovo Ordine Ricevuto!
                </Text>
                <Text style={{
                    fontSize: '14px',
                    color: '#a16207',
                    margin: '0',
                }}>
                    Un cliente ha appena effettuato un ordine
                </Text>
            </Section>

            {/* Order Summary */}
            <Section>
                <Row>
                    <Column style={{ width: '50%' }}>
                        <Text style={labelStyle}>Numero Ordine</Text>
                        <Text style={{
                            ...valueStyle,
                            fontSize: '20px',
                            color: emailStyles.colors.primary,
                        }}>
                            #{orderNumber}
                        </Text>
                    </Column>
                    <Column style={{ width: '50%', textAlign: 'right' as const }}>
                        <Text style={labelStyle}>Totale Ordine</Text>
                        <Text style={{
                            ...valueStyle,
                            fontSize: '20px',
                            color: '#16a34a',
                        }}>
                            {formatPrice(total)}
                        </Text>
                    </Column>
                </Row>
                <Text style={{
                    fontSize: '12px',
                    color: emailStyles.colors.textMuted,
                    margin: '8px 0 0 0',
                }}>
                    📅 {formatDate(orderDate, 'it')}
                </Text>
            </Section>

            <Hr style={emailStyles.hr} />

            {/* Customer Info */}
            <Text style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: emailStyles.colors.text,
                margin: '0 0 12px 0',
            }}>
                👤 Informazioni Cliente
            </Text>

            <Section style={infoBoxStyle}>
                <Row>
                    <Column style={{ width: '50%' }}>
                        <Text style={labelStyle}>Nome</Text>
                        <Text style={valueStyle}>{customerName}</Text>
                    </Column>
                    <Column style={{ width: '50%' }}>
                        <Text style={labelStyle}>Tipo</Text>
                        <Text style={{
                            ...valueStyle,
                            color: isGuest ? '#f59e0b' : '#22c55e',
                        }}>
                            {isGuest ? '👤 Ospite' : '✓ Registrato'}
                        </Text>
                    </Column>
                </Row>
                <Row style={{ marginTop: '12px' }}>
                    <Column style={{ width: '50%' }}>
                        <Text style={labelStyle}>Email</Text>
                        <Text style={valueStyle}>
                            <a href={`mailto:${customerEmail}`} style={{ color: emailStyles.colors.primary }}>
                                {customerEmail}
                            </a>
                        </Text>
                    </Column>
                    {customerPhone && (
                        <Column style={{ width: '50%' }}>
                            <Text style={labelStyle}>Telefono</Text>
                            <Text style={valueStyle}>
                                <a href={`tel:${customerPhone}`} style={{ color: emailStyles.colors.primary }}>
                                    {customerPhone}
                                </a>
                            </Text>
                        </Column>
                    )}
                </Row>
            </Section>

            {/* Shipping Address */}
            {shippingAddress && (
                <>
                    <Text style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: emailStyles.colors.text,
                        margin: '24px 0 12px 0',
                    }}>
                        📍 Indirizzo di Spedizione
                    </Text>
                    <Section style={infoBoxStyle}>
                        <Text style={{ margin: '0', fontSize: '14px', color: emailStyles.colors.text }}>
                            {shippingAddress.name}<br />
                            {shippingAddress.address}<br />
                            {shippingAddress.postal} {shippingAddress.city}<br />
                            {shippingAddress.country}
                        </Text>
                    </Section>
                </>
            )}

            {/* Order Items */}
            <Text style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: emailStyles.colors.text,
                margin: '24px 0 12px 0',
            }}>
                📦 Articoli Ordinati ({items.length})
            </Text>

            {items.map((item, index) => (
                <Section key={item.id} style={index < items.length - 1 ? itemRowStyle : { padding: '12px 0' }}>
                    <Row>
                        <Column style={{ width: '50px' }}>
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
                        <Column style={{ paddingLeft: '12px', verticalAlign: 'top' }}>
                            <Text style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: emailStyles.colors.text,
                                margin: '0',
                            }}>
                                {item.productTitle}
                            </Text>
                            <Text style={{
                                fontSize: '12px',
                                color: emailStyles.colors.textMuted,
                                margin: '4px 0 0 0',
                            }}>
                                Qty: {item.quantity}
                            </Text>
                        </Column>
                        <Column style={{ textAlign: 'right' as const, verticalAlign: 'top' }}>
                            <Text style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: emailStyles.colors.primary,
                                margin: '0',
                            }}>
                                {formatPrice(item.price)}
                            </Text>
                        </Column>
                    </Row>
                </Section>
            ))}

            {/* Totals */}
            <Section style={{
                borderTop: `2px solid ${emailStyles.colors.border}`,
                paddingTop: '16px',
                marginTop: '8px',
            }}>
                <Row>
                    <Column style={{ width: '50%' }}>
                        <Text style={{ margin: '4px 0', fontSize: '14px', color: emailStyles.colors.textMuted }}>
                            Subtotale
                        </Text>
                    </Column>
                    <Column style={{ width: '50%', textAlign: 'right' as const }}>
                        <Text style={{ margin: '4px 0', fontSize: '14px', color: emailStyles.colors.text }}>
                            {formatPrice(subtotal)}
                        </Text>
                    </Column>
                </Row>
                <Row>
                    <Column style={{ width: '50%' }}>
                        <Text style={{ margin: '4px 0', fontSize: '14px', color: emailStyles.colors.textMuted }}>
                            Spedizione
                        </Text>
                    </Column>
                    <Column style={{ width: '50%', textAlign: 'right' as const }}>
                        <Text style={{ margin: '4px 0', fontSize: '14px', color: emailStyles.colors.text }}>
                            {formatPrice(shippingCost)}
                        </Text>
                    </Column>
                </Row>
                <Row style={{ marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${emailStyles.colors.border}` }}>
                    <Column style={{ width: '50%' }}>
                        <Text style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: emailStyles.colors.text }}>
                            Totale
                        </Text>
                    </Column>
                    <Column style={{ width: '50%', textAlign: 'right' as const }}>
                        <Text style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#16a34a' }}>
                            {formatPrice(total)}
                        </Text>
                    </Column>
                </Row>
            </Section>

            <Hr style={emailStyles.hr} />

            {/* Action Buttons */}
            <Section style={{ textAlign: 'center', marginTop: '24px' }}>
                <Button
                    href={`${BASE_URL}/admin/orders`}
                    style={emailStyles.button}
                >
                    Gestisci Ordine
                </Button>
            </Section>

            <Text style={{
                ...emailStyles.paragraph,
                textAlign: 'center' as const,
                fontSize: '12px',
                color: emailStyles.colors.textMuted,
                marginTop: '24px',
            }}>
                Questo è un messaggio automatico dal sistema di ordini di Antichità Barbaglia.
            </Text>
        </EmailLayout>
    );
};

export default AdminNewOrderEmail;
