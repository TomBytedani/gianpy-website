import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Device breakpoints for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    // Common image sizes for the sizes attribute
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Prefer modern formats for better compression
    formats: ['image/avif', 'image/webp'],
    // Higher quality for antique furniture images (default is 75)
    // Using 85 for better detail on product images
    // Minimum cache TTL (in seconds) - 1 week default
    minimumCacheTTL: 604800,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-c08ae0de86f94e598029df0900cc46b3.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
        pathname: '/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);

