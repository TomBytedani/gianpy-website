'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useSiteSettings } from '@/hooks/useSiteSettings';

/**
 * Sanitizes a WhatsApp URL to ensure it's in the correct format.
 * This is a safety net for any legacy data that might not be properly formatted.
 */
function sanitizeWhatsAppUrl(url: string | null): string | null {
    if (!url || !url.trim()) return null;

    let cleaned = url.trim();

    // If it's already a wa.me URL, extract the number part
    if (cleaned.includes('wa.me/')) {
        const match = cleaned.match(/wa\.me\/(.+)/);
        if (match) {
            cleaned = match[1];
        }
    }

    // Remove all spaces, dashes, parentheses, and plus signs
    cleaned = cleaned.replace(/[\s\-\(\)\+]/g, '');

    // If empty after cleaning, return null
    if (!cleaned) return null;

    // Return the properly formatted URL
    return `https://wa.me/${cleaned}`;
}

export function Footer() {
    const t = useTranslations('common');
    const locale = useLocale();
    const { settings, getOpeningHours } = useSiteSettings();
    const year = new Date().getFullYear();

    // Get opening hours for current locale
    const openingHours = getOpeningHours(locale);

    // Sanitize WhatsApp URL to handle any legacy data with spaces or plus signs
    const sanitizedWhatsAppUrl = sanitizeWhatsAppUrl(settings?.whatsappUrl ?? null);
    return (
        <footer className="bg-[var(--foreground)] text-[var(--background)] py-16 relative z-10" style={{ isolation: 'isolate' }}>
            <div className="container-elegant">
                <div className="grid gap-8 md:grid-cols-4">
                    {/* Brand Column */}
                    <div className="md:col-span-2">
                        <Link href="/" className="inline-block">
                            <span className="font-display text-3xl text-[var(--primary)]">
                                {t('appName')}
                            </span>
                        </Link>
                        <p className="mt-4 text-sm text-[var(--background)]/70 max-w-sm">
                            {t('footer.description')}
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-4 mt-6">
                            {settings?.facebookUrl && (
                                <a
                                    href={settings.facebookUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full border border-[var(--background)]/30 flex items-center justify-center hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                                    aria-label="Facebook"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                                    </svg>
                                </a>
                            )}
                            {settings?.instagramUrl && (
                                <a
                                    href={settings.instagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full border border-[var(--background)]/30 flex items-center justify-center hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                                    aria-label="Instagram"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <rect x="2" y="2" width="20" height="20" rx="5" strokeWidth="2" />
                                        <circle cx="12" cy="12" r="4" strokeWidth="2" />
                                        <circle cx="18" cy="6" r="1" fill="currentColor" />
                                    </svg>
                                </a>
                            )}
                            {sanitizedWhatsAppUrl && (
                                <a
                                    href={sanitizedWhatsAppUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full border border-[var(--background)]/30 flex items-center justify-center hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                                    aria-label="WhatsApp"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Links Column */}
                    <div>
                        <h4 className="font-medium text-[var(--background)] mb-4">{t('footer.usefulLinks')}</h4>
                        <ul className="space-y-3 text-sm text-[var(--background)]/70">
                            <li>
                                <Link href="/shop" className="hover:text-[var(--primary)] transition-colors">
                                    {t('nav.shop')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-[var(--primary)] transition-colors">
                                    {t('nav.about')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-[var(--primary)] transition-colors">
                                    {t('nav.contact')}
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-[var(--primary)] transition-colors">
                                    {t('footer.terms')}
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-[var(--primary)] transition-colors">
                                    {t('footer.privacy')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h4 className="font-medium text-[var(--background)] mb-4">{t('nav.contact')}</h4>
                        <ul className="space-y-3 text-sm text-[var(--background)]/70">
                            <li className="flex items-start gap-2">
                                <svg
                                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                {settings ? `${settings.address}, ${settings.city}` : 'Milano, 20134, MI'}
                            </li>
                            <li className="flex items-start gap-2">
                                <svg
                                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                    />
                                </svg>
                                <a href={`tel:${settings?.phone || '+39 328 406 3084'}`} className="hover:text-[var(--primary)] transition-colors">
                                    {settings?.phone || '+39 328 406 3084'}
                                </a>
                            </li>
                            <li className="flex items-start gap-2">
                                <svg
                                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                                <a href={`mailto:${settings?.email || 'antichitabarbaglia@gmail.com'}`} className="hover:text-[var(--primary)] transition-colors">
                                    {settings?.email || 'antichitabarbaglia@gmail.com'}
                                </a>
                            </li>
                        </ul>

                        {/* Hours */}
                        <h4 className="font-medium text-[var(--background)] mb-4 mt-6">{t('footer.hours')}</h4>
                        <ul className="space-y-2 text-sm text-[var(--background)]/70">
                            {openingHours.length > 0 ? (
                                openingHours.map((line, index) => (
                                    <li key={index}>{line}</li>
                                ))
                            ) : (
                                <>
                                    <li>{t('footer.hoursWeekdays')}</li>
                                    <li>{t('footer.hoursSaturday')}</li>
                                    <li>{t('footer.hoursSunday')}</li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-[var(--background)]/20 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                        <p className="text-sm text-[var(--background)]/50">
                            {t('footer.copyright', { year })}
                        </p>
                        <span className="hidden md:inline text-[var(--background)]/30">|</span>
                        <p className="text-sm text-[var(--background)]/50">
                            {t('footer.vatNumber')}: 09599770964
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[var(--background)]/50">
                        <span>{t('footer.securePaymentsWith')}</span>
                        <div className="flex gap-2">
                            {/* Visa Icon */}
                            <div className="w-14 h-10 bg-[var(--background)]/10 rounded flex items-center justify-center" title="Visa">
                                <svg viewBox="0 0 48 48" className="w-10 h-6" fill="currentColor">
                                    <path d="M18.4 31.1l2.5-15.4H24l-2.5 15.4h-3.1zm15.2-15c-.6-.2-1.6-.5-2.8-.5-3.1 0-5.3 1.6-5.3 4 0 1.7 1.6 2.7 2.8 3.3 1.2.6 1.6 1 1.6 1.5 0 .8-1 1.2-1.9 1.2-1.2 0-1.9-.2-3-.7l-.4-.2-.4 2.7c.7.3 2.1.6 3.5.6 3.3 0 5.5-1.6 5.5-4.1 0-1.4-.8-2.4-2.7-3.3-1.1-.6-1.8-.9-1.8-1.5 0-.5.6-1 1.8-1 1 0 1.8.2 2.4.5l.3.1.4-2.6zm8.1-.4h-2.4c-.7 0-1.3.2-1.6 1l-4.5 10.8h3.2l.6-1.8h3.9l.4 1.8h2.8l-2.4-11.8zm-3.7 7.6c.3-.7 1.2-3.3 1.2-3.3l.4-1 .2 1s.6 2.8.7 3.4h-2.5zM16 15.7l-3.1 10.5-.3-1.6c-.6-1.9-2.3-4-4.2-5l2.7 10.4h3.3l4.9-14.3H16z" />
                                    <path fill="#F7A600" d="M10.3 15.7H5.1l-.1.3c3.9 1 6.5 3.4 7.5 6.3l-1.1-5.5c-.2-.9-.8-1.1-1.1-1.1z" />
                                </svg>
                            </div>
                            {/* Mastercard Icon */}
                            <div className="w-14 h-10 bg-[var(--background)]/10 rounded flex items-center justify-center" title="Mastercard">
                                <svg viewBox="0 0 48 48" className="w-10 h-6">
                                    <circle cx="18" cy="24" r="10" fill="#EB001B" />
                                    <circle cx="30" cy="24" r="10" fill="#F79E1B" />
                                    <path d="M24 17.3c1.9 1.5 3 3.9 3 6.7s-1.1 5.2-3 6.7c-1.9-1.5-3-3.9-3-6.7s1.1-5.2 3-6.7z" fill="#FF5F00" />
                                </svg>
                            </div>
                            {/* Amex Icon */}
                            <div className="w-14 h-10 bg-[var(--background)]/10 rounded flex items-center justify-center" title="American Express">
                                <svg viewBox="0 0 48 48" className="w-10 h-6" fill="currentColor">
                                    <rect x="4" y="12" width="40" height="24" rx="2" fill="#006FCF" />
                                    <text x="24" y="27" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial">AMEX</text>
                                </svg>
                            </div>
                            {/* PayPal Icon */}
                            <div className="w-14 h-10 bg-[var(--background)]/10 rounded flex items-center justify-center" title="PayPal">
                                <svg viewBox="0 0 48 48" className="w-10 h-6">
                                    <path fill="#003087" d="M18.5 35.5h-4l2.7-17h5.3c2.3 0 4 .7 5 2 .9 1.2 1.1 2.8.6 4.6-.6 2.3-1.8 4-3.6 5.2-1.7 1.1-3.7 1.7-5.9 1.7h-2.5l-1.6 3.5z" />
                                    <path fill="#009CDE" d="M35.2 18c.1-.5.1-1 0-1.5-.9-2.6-3.5-3.5-6.6-3.5h-7l-3.5 22h4.5l.9-5.5h2.8c2.7 0 5-.8 6.8-2.5 1.7-1.7 2.7-3.9 2.1-9z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
