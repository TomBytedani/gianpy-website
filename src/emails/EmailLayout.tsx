/**
 * Shared email layout and styling for all email templates
 * Uses React Email components for consistent, responsive email design
 */

import {
    Body,
    Container,
    Head,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';
import { BASE_URL, EMAIL_FROM_NAME } from '@/lib/email';

interface EmailLayoutProps {
    preview: string;
    children: React.ReactNode;
    locale?: 'it' | 'en';
}

// Colors matching the site design
const colors = {
    primary: '#b8860b', // Antique gold
    background: '#faf7f2', // Warm white
    text: '#1a1a1a', // Dark charcoal
    textMuted: '#6b6b6b', // Muted text
    border: '#e8e2d8', // Cream border
};

// Common styles
const main: React.CSSProperties = {
    backgroundColor: colors.background,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container: React.CSSProperties = {
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '600px',
};

const logoStyle: React.CSSProperties = {
    margin: '0 auto',
    display: 'block',
};

const headerStyle: React.CSSProperties = {
    textAlign: 'center' as const,
    padding: '24px 20px',
};

const brandNameStyle: React.CSSProperties = {
    fontSize: '28px',
    fontFamily: '"Playfair Display", Georgia, serif',
    fontStyle: 'italic',
    color: colors.primary,
    margin: '0',
};

const contentStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '40px',
    marginTop: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
};

const footerStyle: React.CSSProperties = {
    textAlign: 'center' as const,
    padding: '24px 20px',
    color: colors.textMuted,
};

const footerTextStyle: React.CSSProperties = {
    fontSize: '12px',
    lineHeight: '18px',
    margin: '4px 0',
};

const hrStyle: React.CSSProperties = {
    borderColor: colors.border,
    margin: '24px 0',
};

const linkStyle: React.CSSProperties = {
    color: colors.primary,
    textDecoration: 'underline',
};

export const EmailLayout: React.FC<EmailLayoutProps> = ({
    preview,
    children,
    locale = 'it',
}) => {
    const footerText = locale === 'it'
        ? 'Questa email è stata inviata da'
        : 'This email was sent by';

    const unsubscribeText = locale === 'it'
        ? 'Se non desideri più ricevere queste email, puoi'
        : 'If you no longer wish to receive these emails, you can';

    const unsubscribeLinkText = locale === 'it'
        ? 'modificare le tue preferenze'
        : 'update your preferences';

    return (
        <Html>
            <Head />
            <Preview>{preview}</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header with Logo */}
                    <Section style={headerStyle}>
                        <Text style={brandNameStyle}>{EMAIL_FROM_NAME}</Text>
                    </Section>

                    {/* Main Content */}
                    <Section style={contentStyle}>
                        {children}
                    </Section>

                    {/* Footer */}
                    <Section style={footerStyle}>
                        <Hr style={hrStyle} />
                        <Text style={footerTextStyle}>
                            {footerText} {EMAIL_FROM_NAME}
                        </Text>
                        <Text style={footerTextStyle}>
                            Via Roma 123, 10100 Torino, Italia
                        </Text>
                        <Text style={footerTextStyle}>
                            <Link href={`mailto:info@barbaglia-restauri.it`} style={linkStyle}>
                                info@barbaglia-restauri.it
                            </Link>
                            {' | '}
                            <Link href="tel:+390111234567" style={linkStyle}>
                                +39 011 123 4567
                            </Link>
                        </Text>
                        <Text style={{ ...footerTextStyle, marginTop: '16px' }}>
                            {unsubscribeText}{' '}
                            <Link href={`${BASE_URL}/account/settings`} style={linkStyle}>
                                {unsubscribeLinkText}
                            </Link>
                            .
                        </Text>
                        <Text style={footerTextStyle}>
                            © {new Date().getFullYear()} {EMAIL_FROM_NAME}. All rights reserved.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

// Export common styles for reuse in templates
export const emailStyles = {
    colors,
    heading: {
        fontSize: '24px',
        fontWeight: 'bold' as const,
        color: colors.text,
        margin: '0 0 16px 0',
    } as React.CSSProperties,
    paragraph: {
        fontSize: '16px',
        lineHeight: '24px',
        color: colors.text,
        margin: '16px 0',
    } as React.CSSProperties,
    button: {
        backgroundColor: colors.primary,
        borderRadius: '4px',
        color: '#ffffff',
        display: 'inline-block',
        fontSize: '16px',
        fontWeight: 'bold' as const,
        padding: '12px 24px',
        textDecoration: 'none',
        textAlign: 'center' as const,
    } as React.CSSProperties,
    hr: hrStyle,
    link: linkStyle,
    muted: {
        fontSize: '14px',
        color: colors.textMuted,
    } as React.CSSProperties,
};

export default EmailLayout;
