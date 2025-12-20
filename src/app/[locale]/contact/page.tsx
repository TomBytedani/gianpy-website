'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, Button, Input, Textarea, Select } from '@/components/ui';
import { useTranslations, useLocale } from 'next-intl';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function ContactPage() {
    const t = useTranslations('contact');
    const tForm = useTranslations('contact.form');
    const tInfo = useTranslations('contact.info');
    const tVisit = useTranslations('contact.visit');
    const tFooter = useTranslations('common.footer');
    const locale = useLocale();
    const { settings, getOpeningHours, getFullAddress } = useSiteSettings();

    // Get opening hours for current locale
    const openingHours = getOpeningHours(locale);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || tForm('errorMessage'));
            }

            setIsSubmitted(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : tForm('errorMessage'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Header />

            {/* Page Header */}
            <section className="pt-28 pb-16 bg-[var(--background-alt)]">
                <div className="container-elegant">
                    <div className="text-center max-w-2xl mx-auto">
                        <span className="font-display text-3xl text-[var(--primary)] block mb-2">{t('title')}</span>
                        <h1 className="text-[var(--foreground)]">{t('subtitle')}</h1>
                        <p className="mt-4 text-[var(--muted)]">
                            {t('description')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Content */}
            <section className="py-16">
                <div className="container-elegant">
                    <div className="grid gap-12 lg:grid-cols-5">
                        {/* Contact Form */}
                        <div className="lg:col-span-3">
                            <Card padding="lg">
                                {isSubmitted ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                                            <svg
                                                className="w-8 h-8 text-green-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-display italic text-[var(--foreground)]">
                                            {tForm('success')}
                                        </h3>
                                        <p className="mt-3 text-[var(--muted)]">
                                            {tForm('successMessage')}
                                        </p>
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                setIsSubmitted(false);
                                                setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                                            }}
                                            className="mt-6"
                                        >
                                            {tForm('send')}
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-xl font-display italic text-[var(--foreground)] mb-6">
                                            {tForm('title')}
                                        </h2>

                                        {error && (
                                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                                {error}
                                            </div>
                                        )}

                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div className="grid gap-6 md:grid-cols-2">
                                                <Input
                                                    label={`${tForm('name')} *`}
                                                    name="name"
                                                    placeholder={tForm('namePlaceholder')}
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                <Input
                                                    label={`${tForm('email')} *`}
                                                    name="email"
                                                    type="email"
                                                    placeholder={tForm('emailPlaceholder')}
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>

                                            <div className="grid gap-6 md:grid-cols-2">
                                                <Input
                                                    label={tForm('phone')}
                                                    name="phone"
                                                    type="tel"
                                                    placeholder={tForm('phonePlaceholder')}
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                />
                                                <Select
                                                    label={`${tForm('subject')} *`}
                                                    name="subject"
                                                    placeholder={tForm('subjectPlaceholder')}
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    options={[
                                                        { value: 'info', label: tForm('subjectOptions.info') },
                                                        { value: 'product', label: tForm('subjectOptions.product') },
                                                        { value: 'visit', label: tForm('subjectOptions.visit') },
                                                        { value: 'other', label: tForm('subjectOptions.other') },
                                                    ]}
                                                />
                                            </div>

                                            <Textarea
                                                label={`${tForm('message')} *`}
                                                name="message"
                                                placeholder={tForm('messagePlaceholder')}
                                                value={formData.message}
                                                onChange={handleChange}
                                                rows={6}
                                                required
                                            />

                                            <div className="flex justify-end">
                                                <Button type="submit" variant="primary" isLoading={isSubmitting}>
                                                    {isSubmitting ? tForm('sending') : tForm('send')}
                                                </Button>
                                            </div>
                                        </form>
                                    </>
                                )}
                            </Card>
                        </div>

                        {/* Contact Info Sidebar */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Address Card */}
                            <Card padding="lg">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                                        <svg
                                            className="w-6 h-6 text-[var(--primary)]"
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
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-[var(--foreground)]">{tInfo('address')}</h3>
                                        <p className="mt-1 text-sm text-[var(--muted)]">
                                            {settings?.address || 'Via Roma, 123'}<br />
                                            {settings?.postalCode || '28921'} {settings?.city || 'Verbania'}<br />
                                            {settings?.country || 'Italia'}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Phone Card */}
                            <Card padding="lg">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                                        <svg
                                            className="w-6 h-6 text-[var(--primary)]"
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
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-[var(--foreground)]">{tInfo('phone')}</h3>
                                        <p className="mt-1 text-sm text-[var(--muted)]">
                                            <a href={`tel:${settings?.phone || '+39 0323 123456'}`} className="hover:text-[var(--primary)] transition-colors">
                                                {settings?.phone || '+39 0323 123456'}
                                            </a>
                                        </p>
                                        {settings?.whatsappUrl && (
                                            <p className="text-xs text-[var(--muted)] mt-1">
                                                {tInfo('whatsappAvailable')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            {/* Email Card */}
                            <Card padding="lg">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                                        <svg
                                            className="w-6 h-6 text-[var(--primary)]"
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
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-[var(--foreground)]">{tInfo('email')}</h3>
                                        <p className="mt-1 text-sm text-[var(--muted)]">
                                            <a href={`mailto:${settings?.email || 'info@antichitabarbaglia.com'}`} className="hover:text-[var(--primary)] transition-colors">
                                                {settings?.email || 'info@antichitabarbaglia.com'}
                                            </a>
                                        </p>
                                        <p className="text-xs text-[var(--muted)] mt-1">
                                            {tInfo('responseTime')}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Hours Card */}
                            <Card padding="lg">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                                        <svg
                                            className="w-6 h-6 text-[var(--primary)]"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-[var(--foreground)]">{tInfo('hours')}</h3>
                                        <ul className="mt-2 text-sm text-[var(--muted)] space-y-1">
                                            {openingHours.length > 0 ? (
                                                openingHours.map((line, index) => (
                                                    <li key={index}>{line}</li>
                                                ))
                                            ) : (
                                                <>
                                                    <li className="flex justify-between">
                                                        <span>{tFooter('hoursWeekdays').split(':')[0]}</span>
                                                        <span>9:00 - 18:00</span>
                                                    </li>
                                                    <li className="flex justify-between">
                                                        <span>{tFooter('hoursSaturday').split(':')[0]}</span>
                                                        <span>10:00 - 13:00</span>
                                                    </li>
                                                    <li className="flex justify-between">
                                                        <span>{tFooter('hoursSunday').split(':')[0]}</span>
                                                        <span className="text-[var(--accent)]">{tFooter('hoursSunday').split(':')[1].trim()}</span>
                                                    </li>
                                                </>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </Card>

                            {/* Visit Banner - Hidden until booking functionality is implemented
                            <div className="bg-[var(--primary)] text-[var(--background)] rounded-lg p-6 text-center">
                                <span className="font-script text-2xl block">{tVisit('title')}</span>
                                <p className="mt-2 text-sm opacity-90">
                                    {t('description')}
                                </p>
                                <button
                                    className="mt-4 inline-flex items-center justify-center font-body font-medium uppercase tracking-wider rounded-[var(--radius-sm)] py-3 px-6 text-sm transition-all duration-[var(--transition-fast)] active:scale-[0.98]"
                                    style={{
                                        backgroundColor: 'var(--background)',
                                        color: 'var(--primary)',
                                        border: '1px solid var(--background)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--background-alt)';
                                        e.currentTarget.style.borderColor = 'var(--background-alt)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--background)';
                                        e.currentTarget.style.borderColor = 'var(--background)';
                                    }}
                                >
                                    {tVisit('bookVisit')}
                                </button>
                            </div>
                            */}
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section (Placeholder) */}
            <section className="pb-16">
                <div className="container-elegant">
                    <div className="aspect-[21/9] bg-gradient-to-br from-[#d4c5a9] to-[#a89670] rounded-lg flex items-center justify-center">
                        <div className="text-center text-[var(--background)]/50">
                            <svg
                                className="w-16 h-16 mx-auto mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                                />
                            </svg>
                            <p className="text-sm">Interactive map</p>
                            <p className="text-xs">Via Roma 123, Firenze</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}
