import { getRequestConfig } from 'next-intl/server';

// List of supported locales (defined here to avoid circular dependency)
export const locales = ['it', 'en'] as const;
export type Locale = (typeof locales)[number];

// Default locale (Italian)
export const defaultLocale: Locale = 'it';

// Load the messages for a given locale
export default getRequestConfig(async ({ requestLocale }) => {
    // This typically corresponds to the `[locale]` segment
    let locale = await requestLocale;

    // Ensure that a valid locale is used
    if (!locale || !locales.includes(locale as Locale)) {
        locale = defaultLocale;
    }

    return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default,
    };
});
