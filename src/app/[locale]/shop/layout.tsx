import { Metadata } from 'next';

type Props = {
    params: Promise<{ locale: string }>;
    children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://antichitabarbaglia.com';

    const titleMap: Record<string, string> = {
        en: 'Exclusive Antique Furniture',
        it: 'Mobili Antichi Esclusivi',
    };

    const descriptionMap: Record<string, string> = {
        en: 'Browse our curated collection of premium antique furniture. Louis XVI chests, Empire mirrors, Victorian tables, and more from Italy.',
        it: 'Sfoglia la nostra collezione di mobili antichi di pregio. Cassettoni Luigi XVI, specchiere Impero, tavoli vittoriani e altro ancora dall\'Italia.',
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
            url: `${baseUrl}/${locale}/shop`,
        },
        twitter: {
            card: 'summary_large_image',
            title: titleMap[locale] || titleMap.en,
            description: descriptionMap[locale] || descriptionMap.en,
        },
        alternates: {
            canonical: `${baseUrl}/${locale}/shop`,
            languages: {
                'en': `${baseUrl}/en/shop`,
                'it': `${baseUrl}/it/shop`,
            },
        },
    };
}

export default function ShopLayout({ children }: Props) {
    return <>{children}</>;
}
