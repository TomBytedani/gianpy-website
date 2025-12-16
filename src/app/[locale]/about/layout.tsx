import { Metadata } from 'next';

type Props = {
    params: Promise<{ locale: string }>;
    children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://antichitabarbaglia.com';

    const titleMap: Record<string, string> = {
        en: 'About Us - Our Story & Expertise',
        it: 'Chi Siamo - La Nostra Storia e Competenza',
    };

    const descriptionMap: Record<string, string> = {
        en: 'Discover the passion behind Antichità Barbaglia. With over 30 years of experience in antique furniture restoration and curation, we bring history to your home.',
        it: 'Scopri la passione dietro Antichità Barbaglia. Con oltre 30 anni di esperienza nel restauro e nella cura di mobili antichi, portiamo la storia nella tua casa.',
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
            url: `${baseUrl}/${locale}/about`,
        },
        twitter: {
            card: 'summary_large_image',
            title: titleMap[locale] || titleMap.en,
            description: descriptionMap[locale] || descriptionMap.en,
        },
        alternates: {
            canonical: `${baseUrl}/${locale}/about`,
            languages: {
                'en': `${baseUrl}/en/about`,
                'it': `${baseUrl}/it/about`,
            },
        },
    };
}

export default function AboutLayout({ children }: Props) {
    return <>{children}</>;
}
