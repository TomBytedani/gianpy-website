import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

type Props = {
    params: Promise<{ slug: string; locale: string }>;
    children: React.ReactNode;
};

async function getProduct(slug: string) {
    try {
        const product = await prisma.product.findUnique({
            where: { slug },
            include: {
                category: true,
                images: {
                    where: { isPrimary: true },
                    take: 1,
                },
            },
        });
        return product;
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, locale } = await params;
    const product = await getProduct(slug);

    if (!product) {
        return {
            title: 'Product Not Found',
            description: 'The requested product could not be found.',
        };
    }

    const title = locale === 'en' && product.titleEn ? product.titleEn : product.title;
    const description = locale === 'en' && product.descriptionEn
        ? product.descriptionEn.substring(0, 160)
        : product.description.substring(0, 160);
    const primaryImage = product.images[0]?.url;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://antichitabarbaglia.com';

    return {
        title,
        description,
        openGraph: {
            title: `${title} | Antichità Barbaglia`,
            description,
            type: 'website',
            locale: locale === 'en' ? 'en_US' : 'it_IT',
            alternateLocale: locale === 'en' ? 'it_IT' : 'en_US',
            siteName: 'Antichità Barbaglia',
            url: `${baseUrl}/${locale}/shop/${product.slug}`,
            images: primaryImage ? [
                {
                    url: primaryImage,
                    width: 800,
                    height: 800,
                    alt: title,
                },
            ] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: primaryImage ? [primaryImage] : undefined,
        },
        alternates: {
            canonical: `${baseUrl}/${locale}/shop/${product.slug}`,
            languages: {
                'en': `${baseUrl}/en/shop/${product.slug}`,
                'it': `${baseUrl}/it/shop/${product.slug}`,
            },
        },
    };
}

export default function ProductLayout({ children }: Props) {
    return <>{children}</>;
}
