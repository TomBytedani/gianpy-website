import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://antichitabarbaglia.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/api/',
                    '/auth/',
                    '/account/',
                    '/cart',
                    '/checkout',
                    '/order-confirmation/',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
