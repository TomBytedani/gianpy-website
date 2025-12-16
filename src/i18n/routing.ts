import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    // A list of all locales that are supported
    locales: ['it', 'en'] as const,

    // Used when no locale matches
    defaultLocale: 'it',

    // Disable automatic redirects based on the browser language (Accept-Language).
    // Users can still switch locales via the URL or a language switcher.
    localeDetection: false,

    // Locale prefix strategy: 'as-needed' means default locale has no prefix
    localePrefix: 'as-needed',
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export type Locale = (typeof routing.locales)[number];
export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing);
