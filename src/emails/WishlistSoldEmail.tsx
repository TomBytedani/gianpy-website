/**
 * Wishlist Item Sold Email Template
 * Sent when a product in user's wishlist is sold
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

interface WishlistSoldEmailProps {
    customerName: string;
    productTitle: string;
    productSlug: string;
    productPrice: number | string;
    productImageUrl?: string;
    locale?: 'it' | 'en';
}

const content = {
    it: {
        preview: (productTitle: string) => `Il tuo articolo preferito "${productTitle}" è stato venduto`,
        greeting: (name: string) => `Gentile ${name},`,
        subject: 'Un articolo dalla tua lista desideri è stato venduto',
        message: 'Volevamo informarti che il seguente articolo che avevi salvato nella tua lista desideri è stato venduto:',
        soldLabel: 'VENDUTO',
        dontWorry: 'Non preoccuparti!',
        alternatives: 'Abbiamo molti altri pezzi unici e straordinari nella nostra collezione. Vieni a scoprire i nuovi arrivi!',
        viewShop: 'Esplora la Collezione',
        manageWishlist: 'Gestisci Lista Desideri',
    },
    en: {
        preview: (productTitle: string) => `Your wishlist item "${productTitle}" has been sold`,
        greeting: (name: string) => `Dear ${name},`,
        subject: 'An item from your wishlist has been sold',
        message: 'We wanted to let you know that the following item you saved to your wishlist has been sold:',
        soldLabel: 'SOLD',
        dontWorry: 'Don\'t worry!',
        alternatives: 'We have many other unique and extraordinary pieces in our collection. Come discover our new arrivals!',
        viewShop: 'Explore the Collection',
        manageWishlist: 'Manage Wishlist',
    },
};

const productCardStyle: React.CSSProperties = {
    border: `1px solid ${emailStyles.colors.border}`,
    borderRadius: '8px',
    padding: '16px',
    marginTop: '24px',
    marginBottom: '24px',
};

const productImageStyle: React.CSSProperties = {
    width: '120px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '4px',
};

const soldBadgeStyle: React.CSSProperties = {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'inline-block',
    marginTop: '8px',
};

export const WishlistSoldEmail: React.FC<WishlistSoldEmailProps> = ({
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
                {t.subject}
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
                            textDecoration: 'line-through',
                        }}>
                            {productTitle}
                        </Text>
                        <Text style={{
                            fontSize: '16px',
                            color: emailStyles.colors.textMuted,
                            margin: '8px 0',
                            textDecoration: 'line-through',
                        }}>
                            {formatPrice(productPrice)}
                        </Text>
                        <span style={soldBadgeStyle}>
                            {t.soldLabel}
                        </span>
                    </Column>
                </Row>
            </Section>

            <Hr style={emailStyles.hr} />

            <Text style={{ ...emailStyles.heading, fontSize: '18px' }}>
                {t.dontWorry}
            </Text>

            <Text style={emailStyles.paragraph}>
                {t.alternatives}
            </Text>

            {/* CTA Buttons */}
            <Section style={{ textAlign: 'center', marginTop: '32px' }}>
                <Button
                    href={`${BASE_URL}/shop`}
                    style={emailStyles.button}
                >
                    {t.viewShop}
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
                    {t.manageWishlist}
                </Button>
            </Section>
        </EmailLayout>
    );
};

export default WishlistSoldEmail;
