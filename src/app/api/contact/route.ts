import { NextRequest, NextResponse } from 'next/server';
import { sendContactFormReceiptEmail, sendContactFormAdminNotification } from '@/emails';

interface ContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
    phone?: string;
    locale?: 'it' | 'en';
}

// Admin email to receive contact form notifications
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@barbaglia-restauri.it';

// Validate email format
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// POST /api/contact - Submit contact form
export async function POST(request: NextRequest) {
    try {
        const body: ContactFormData = await request.json();
        const { name, email, subject, message, phone, locale = 'it' } = body;

        // Validation
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                {
                    error: locale === 'it'
                        ? 'Tutti i campi obbligatori devono essere compilati'
                        : 'All required fields must be filled'
                },
                { status: 400 }
            );
        }

        if (!isValidEmail(email)) {
            return NextResponse.json(
                {
                    error: locale === 'it'
                        ? 'Indirizzo email non valido'
                        : 'Invalid email address'
                },
                { status: 400 }
            );
        }

        if (name.length < 2 || name.length > 100) {
            return NextResponse.json(
                {
                    error: locale === 'it'
                        ? 'Il nome deve essere tra 2 e 100 caratteri'
                        : 'Name must be between 2 and 100 characters'
                },
                { status: 400 }
            );
        }

        if (subject.length < 3 || subject.length > 200) {
            return NextResponse.json(
                {
                    error: locale === 'it'
                        ? "L'oggetto deve essere tra 3 e 200 caratteri"
                        : 'Subject must be between 3 and 200 characters'
                },
                { status: 400 }
            );
        }

        if (message.length < 10 || message.length > 5000) {
            return NextResponse.json(
                {
                    error: locale === 'it'
                        ? 'Il messaggio deve essere tra 10 e 5000 caratteri'
                        : 'Message must be between 10 and 5000 characters'
                },
                { status: 400 }
            );
        }

        // Log the submission
        console.log('Contact form submission:', {
            name,
            email,
            phone,
            subject,
            message: message.substring(0, 100) + '...',
            timestamp: new Date().toISOString(),
        });

        // Send emails
        const emailResults = await Promise.allSettled([
            // Send confirmation email to the customer
            sendContactFormReceiptEmail({
                to: email,
                customerName: name,
                subject,
                message,
                locale,
            }),
            // Send notification to admin
            sendContactFormAdminNotification({
                adminEmail: ADMIN_EMAIL,
                customerName: name,
                customerEmail: email,
                subject: phone ? `${subject} (Tel: ${phone})` : subject,
                message,
            }),
        ]);

        // Log email sending results
        emailResults.forEach((result, index) => {
            const emailType = index === 0 ? 'Customer receipt' : 'Admin notification';
            if (result.status === 'fulfilled') {
                console.log(`${emailType} email sent successfully`);
            } else {
                console.error(`${emailType} email failed:`, result.reason);
            }
        });

        // Even if emails fail, we return success since we received the message
        // The admin can still see it in the logs
        return NextResponse.json({
            success: true,
            message: locale === 'it'
                ? 'Messaggio inviato con successo. Ti risponderemo al più presto.'
                : 'Message sent successfully. We will get back to you soon.',
        });
    } catch (error) {
        console.error('Error processing contact form:', error);
        return NextResponse.json(
            { error: "Si è verificato un errore nell'invio del messaggio. Riprova più tardi." },
            { status: 500 }
        );
    }
}
