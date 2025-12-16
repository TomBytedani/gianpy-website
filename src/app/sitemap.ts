import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://antichitabarbaglia.com';
    const locales = ['it', 'en'];
    const staticPages = ['', 'shop', 'about', 'contact'];

    // Generate static page entries for each locale
    const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
        staticPages.map((page) => ({
            url: `${baseUrl}/${locale}${page ? `/${page}` : ''}`,
            lastModified: new Date(),
            changeFrequency: page === '' ? 'weekly' : 'monthly' as const,
            priority: page === '' ? 1.0 : page === 'shop' ? 0.9 : 0.7,
        }))
    );

    // Fetch all products for dynamic entries
    let productEntries: MetadataRoute.Sitemap = [];
    try {
        const products = await prisma.product.findMany({
            select: {
                slug: true,
                updatedAt: true,
                status: true,
            },
            where: {
                // Include all products in sitemap
                status: { in: ['AVAILABLE', 'RESERVED', 'COMING_SOON', 'SOLD'] },
            },
        });

        productEntries = locales.flatMap((locale) =>
            products.map((product) => ({
                url: `${baseUrl}/${locale}/shop/${product.slug}`,
                lastModified: product.updatedAt,
                changeFrequency: product.status === 'AVAILABLE' ? 'weekly' : 'monthly' as const,
                priority: product.status === 'AVAILABLE' ? 0.8 : 0.5,
            }))
        );
    } catch (error) {
        console.error('Error fetching products for sitemap:', error);
    }

    return [...staticEntries, ...productEntries];
}
