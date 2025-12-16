import { Metadata } from 'next';

type Props = {
    params: Promise<{ locale: string }>;
    children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://antichitabarbaglia.com';

    const titleMap: Record<string, string> = {
        en: 'Contact Us - Get in Touch',
        it: 'Contattaci - Mettiti in Contatto',
    };

    const descriptionMap: Record<string, string> = {
        en: 'Have questions about our antique furniture collection? Contact Antichità Barbaglia today. We are here to help with inquiries, appointments, and more.',
        it: 'Hai domande sulla nostra collezione di mobili antichi? Contatta Antichità Barbaglia oggi. Siamo qui per aiutarti con richieste, appuntamenti e altro.',
    };

    return {
        title: titleMap[locale] || titleMap.en,
        description: descriptionMap[locale] || descriptionMap.en,
        openGraph: {
            title: `${titleMap[locale] || titleMap.en} | Antichità Barbaglia`,
            description: descriptionMap[locale] || descriptionMap.en,
            type: 'website',
            locale: locale === 'en' ? 'en_US' : 'it_IT',
            alternateLocale: locale === 'en' ? 'it_IT' : 'en_US',
            siteName: 'Antichità Barbaglia',
            url: `${baseUrl}/${locale}/contact`,
        },
        twitter: {
            card: 'summary_large_image',
            title: titleMap[locale] || titleMap.en,
            description: descriptionMap[locale] || descriptionMap.en,
        },
        alternates: {
            canonical: `${baseUrl}/${locale}/contact`,
            languages: {
                'en': `${baseUrl}/en/contact`,
                'it': `${baseUrl}/it/contact`,
            },
        },
    };
}

export default function ContactLayout({ children }: Props) {
    return <>{children}</>;
}
