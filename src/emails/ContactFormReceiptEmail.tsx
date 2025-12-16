/**
 * Contact Form Receipt Email Template
 * Sent to confirm that a contact form submission was received
 */

import {
    Hr,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout, emailStyles } from './EmailLayout';

interface ContactFormReceiptEmailProps {
    customerName: string;
    customerEmail: string;
    subject: string;
    message: string;
    locale?: 'it' | 'en';
}

const content = {
    it: {
        preview: 'Abbiamo ricevuto il tuo messaggio - Antichità Barbaglia',
        greeting: (name: string) => `Gentile ${name},`,
        title: 'Abbiamo ricevuto il tuo messaggio',
        confirmation: 'Grazie per averci contattato. Abbiamo ricevuto il tuo messaggio e ti risponderemo il prima possibile.',
        yourMessage: 'Il tuo messaggio',
        subjectLabel: 'Oggetto',
        responseTime: 'Tempo di risposta',
        responseTimeText: 'Di solito rispondiamo entro 24-48 ore lavorative. Per richieste urgenti, non esitare a chiamarci direttamente.',
        contactInfo: 'I nostri contatti',
    },
    en: {
        preview: 'We received your message - Antichità Barbaglia',
        greeting: (name: string) => `Dear ${name},`,
        title: 'We received your message',
        confirmation: 'Thank you for contacting us. We have received your message and will get back to you as soon as possible.',
        yourMessage: 'Your message',
        subjectLabel: 'Subject',
        responseTime: 'Response time',
        responseTimeText: 'We usually respond within 24-48 business hours. For urgent inquiries, feel free to call us directly.',
        contactInfo: 'Our contact details',
    },
};

const messageBoxStyle: React.CSSProperties = {
    backgroundColor: '#f8f6f3',
    borderLeft: `4px solid ${emailStyles.colors.primary}`,
    padding: '16px 20px',
    marginTop: '16px',
    marginBottom: '16px',
    borderRadius: '0 4px 4px 0',
};

export const ContactFormReceiptEmail: React.FC<ContactFormReceiptEmailProps> = ({
    customerName,
    customerEmail,
    subject,
    message,
    locale = 'it',
}) => {
    const t = content[locale];

    return (
        <EmailLayout preview={t.preview} locale={locale}>
            <Text style={emailStyles.paragraph}>
                {t.greeting(customerName || 'Cliente')}
            </Text>

            <Text style={emailStyles.heading}>
                {t.title}
            </Text>

            <Text style={emailStyles.paragraph}>
                {t.confirmation}
            </Text>

            <Hr style={emailStyles.hr} />

            {/* Message Summary */}
            <Section>
                <Text style={{ ...emailStyles.heading, fontSize: '18px' }}>
                    {t.yourMessage}
                </Text>

                <Text style={emailStyles.muted}>
                    {t.subjectLabel}:
                </Text>
                <Text style={{ ...emailStyles.paragraph, marginTop: '4px', fontWeight: 'bold' }}>
                    {subject}
                </Text>

                <Section style={messageBoxStyle}>
                    <Text style={{
                        ...emailStyles.paragraph,
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                    }}>
                        {message}
                    </Text>
                </Section>
            </Section>

            <Hr style={emailStyles.hr} />

            {/* Response Time */}
            <Section>
                <Text style={{ ...emailStyles.heading, fontSize: '18px' }}>
                    {t.responseTime}
                </Text>
                <Text style={emailStyles.paragraph}>
                    {t.responseTimeText}
                </Text>
            </Section>

            {/* Contact Info */}
            <Section>
                <Text style={{ ...emailStyles.heading, fontSize: '18px' }}>
                    {t.contactInfo}
                </Text>
                <Text style={emailStyles.paragraph}>
                    📧 info@barbaglia-restauri.it<br />
                    📞 +39 011 123 4567<br />
                    📍 Via Roma 123, 10100 Torino
                </Text>
            </Section>
        </EmailLayout>
    );
};

export default ContactFormReceiptEmail;
