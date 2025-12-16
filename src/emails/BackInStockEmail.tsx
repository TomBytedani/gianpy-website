/**
 * Back in Stock Email Template
 * Sent when a product in user's wishlist becomes available again
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
import { BASE_URL, formatPrice } from '@/lib/email';

interface BackInStockEmailProps {
    customerName: string;
    productTitle: string;
    productSlug: string;
    productPrice: number | string;
    productImageUrl?: string;
    locale?: 'it' | 'en';
}

const content = {
    it: {
        preview: (productTitle: string) => `Buone notizie! "${productTitle}" è di nuovo disponibile`,
        greeting: (name: string) => `Gentile ${name},`,
        subject: 'Un articolo che desideravi è di nuovo disponibile!',
        message: 'Ottime notizie! Il seguente articolo che avevi salvato nella tua lista desideri è tornato disponibile:',
        availableLabel: 'DISPONIBILE',
        hurry: 'Non perdere questa occasione!',
        urgency: 'I nostri pezzi sono unici e potrebbero essere venduti rapidamente. Non aspettare troppo!',
        viewProduct: 'Acquista Ora',
        viewWishlist: 'Vedi Lista Desideri',
    },
    en: {
        preview: (productTitle: string) => `Great news! "${productTitle}" is back in stock`,
        greeting: (name: string) => `Dear ${name},`,
        subject: 'An item you wanted is back in stock!',
        message: 'Great news! The following item you saved to your wishlist is now available again:',
        availableLabel: 'AVAILABLE',
        hurry: 'Don\'t miss this opportunity!',
        urgency: 'Our pieces are unique and may sell quickly. Don\'t wait too long!',
        viewProduct: 'Buy Now',
        viewWishlist: 'View Wishlist',
    },
};

const productCardStyle: React.CSSProperties = {
    border: `2px solid ${emailStyles.colors.primary}`,
    borderRadius: '8px',
    padding: '16px',
    marginTop: '24px',
    marginBottom: '24px',
    backgroundColor: '#fffef8',
};

const productImageStyle: React.CSSProperties = {
    width: '120px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '4px',
};

const availableBadgeStyle: React.CSSProperties = {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'inline-block',
    marginTop: '8px',
};

export const BackInStockEmail: React.FC<BackInStockEmailProps> = ({
    customerName,
    productTitle,
    productSlug,
    productPrice,
    productImageUrl,
    locale = 'it',
}) => {
    const t = content[locale];

    return (
        <EmailLayout preview={t.preview(productTitle)} locale={locale}>
            <Text style={emailStyles.paragraph}>
                {t.greeting(customerName || 'Cliente')}
            </Text>

            <Text style={emailStyles.heading}>
                🎉 {t.subject}
            </Text>

            <Text style={emailStyles.paragraph}>
                {t.message}
            </Text>

            {/* Product Card */}
            <Section style={productCardStyle}>
                <Row>
                    <Column style={{ width: '120px' }}>
                        {productImageUrl ? (
                            <Img
                                src={productImageUrl}
                                alt={productTitle}
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
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: emailStyles.colors.text,
                            margin: '0',
                        }}>
                            {productTitle}
                        </Text>
                        <Text style={{
                            fontSize: '20px',
                            color: emailStyles.colors.primary,
                            fontWeight: 'bold',
                            margin: '8px 0',
                        }}>
                            {formatPrice(productPrice)}
                        </Text>
                        <span style={availableBadgeStyle}>
                            {t.availableLabel}
                        </span>
                    </Column>
                </Row>
            </Section>

            <Hr style={emailStyles.hr} />

            <Text style={{ ...emailStyles.heading, fontSize: '18px' }}>
                ⏰ {t.hurry}
            </Text>

            <Text style={emailStyles.paragraph}>
                {t.urgency}
            </Text>

            {/* CTA Buttons */}
            <Section style={{ textAlign: 'center', marginTop: '32px' }}>
                <Button
                    href={`${BASE_URL}/shop/${productSlug}`}
                    style={emailStyles.button}
                >
                    {t.viewProduct}
                </Button>
            </Section>

            <Section style={{ textAlign: 'center', marginTop: '16px', marginBottom: '32px' }}>
                <Button
                    href={`${BASE_URL}/account/wishlist`}
                    style={{
                        ...emailStyles.button,
                        backgroundColor: 'transparent',
                        color: emailStyles.colors.primary,
                        border: `2px solid ${emailStyles.colors.primary}`,
                    }}
                >
                    {t.viewWishlist}
                </Button>
            </Section>
        </EmailLayout>
    );
};

export default BackInStockEmail;
