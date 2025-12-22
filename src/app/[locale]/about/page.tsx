import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, Button } from '@/components/ui';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

// R2 public URL for static assets
const R2_PUBLIC_URL = 'https://pub-c08ae0de86f94e598029df0900cc46b3.r2.dev';

export default function AboutPage() {
    const t = useTranslations('about');
    const tCommon = useTranslations('common.buttons');

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-28 pb-16 bg-[var(--background-alt)] overflow-hidden" style={{ isolation: 'isolate' }}>
                {/* Subtle decorative background */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ contain: 'strict', clipPath: 'inset(0)' }}>
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" shapeRendering="crispEdges">
                        <defs>
                            <pattern id="flourish-about" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                                <path
                                    d="M25 0C25 13.8 13.8 25 0 25C13.8 25 25 36.2 25 50C25 36.2 36.2 25 50 25C36.2 25 25 13.8 25 0Z"
                                    fill="var(--primary)"
                                />
                            </pattern>
                        </defs>
                        <rect x="0" y="0" width="100" height="100" fill="url(#flourish-about)" />
                    </svg>
                </div>

                <div className="container-elegant relative">
                    <div className="text-center max-w-3xl mx-auto">
                        <span className="font-display text-3xl text-[var(--primary)] block mb-2">{t('hero.label')}</span>
                        <h1 className="text-[var(--foreground)]">{t('hero.title')}</h1>
                        <p className="mt-4 text-[var(--muted)] max-w-2xl mx-auto">
                            {t('hero.subtitle')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Story Section */}
            <section className="py-20">
                <div className="container-elegant">
                    <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
                        {/* Image */}
                        <div className="relative">
                            <div className="aspect-[4/5] bg-gradient-to-br from-[#d4c5a9] to-[#a89670] rounded-lg overflow-hidden">
                                <img
                                    src={`${R2_PUBLIC_URL}/carlo-e-candela.jpeg`}
                                    alt="Carlo Barbaglia"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {/* Decorative frame */}
                            <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-[var(--primary)] rounded-lg -z-10" />
                        </div>

                        {/* Story Content */}
                        <div>
                            <span className="font-display text-2xl text-[var(--primary)]">{t('story.name')}</span>
                            <h2 className="mt-2 text-[var(--foreground)]">{t('story.subtitle')}</h2>

                            <div className="mt-8 space-y-6 text-[var(--muted)] leading-relaxed">
                                <p>{t('story.content2')}</p>
                                <p>{t('philosophy.content')}</p>
                            </div>

                            <Link href="/contact">
                                <Button variant="primary" className="mt-8">
                                    {tCommon('contactUs')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-[var(--background-alt)]">
                <div className="container-elegant">
                    <div className="text-center mb-12">
                        <span className="font-display text-2xl text-[var(--primary)] block mb-2">{t('values.title')}</span>
                        <h2 className="text-[var(--foreground)]">{t('values.title')}</h2>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        <Card className="text-center" padding="lg">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                                <svg className="w-8 h-8 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-display italic text-[var(--foreground)]">{t('values.passion.title')}</h3>
                            <p className="mt-3 text-sm text-[var(--muted)]">
                                {t('values.passion.description')}
                            </p>
                        </Card>

                        <Card className="text-center" padding="lg">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                                <svg className="w-8 h-8 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-display italic text-[var(--foreground)]">{t('values.authenticity.title')}</h3>
                            <p className="mt-3 text-sm text-[var(--muted)]">
                                {t('values.authenticity.description')}
                            </p>
                        </Card>

                        <Card className="text-center" padding="lg">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                                <svg className="w-8 h-8 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-display italic text-[var(--foreground)]">{t('values.experience.title')}</h3>
                            <p className="mt-3 text-sm text-[var(--muted)]">
                                {t('values.experience.description')}
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Workshop Section */}
            <section className="py-20">
                <div className="container-elegant">
                    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                        <div>
                            <span className="font-display text-2xl text-[var(--primary)]">{t('workshop.title')}</span>
                            <h2 className="mt-2 text-[var(--foreground)]">{t('workshop.title')}</h2>

                            <p className="mt-6 text-[var(--muted)] leading-relaxed">
                                {t('workshop.description')}
                            </p>

                            <ul className="mt-6 space-y-3">
                                {[
                                    'Restauro conservativo e filologico',
                                    'Doratura e argentatura a foglia',
                                    'Lucidatura tradizionale a gommalacca',
                                    'Intarsio e marqueterie',
                                    'Tappezzer and imbottitura storica',
                                    'Consulenza e perizie',
                                ].map((service, index) => (
                                    <li key={index} className="flex items-center gap-3 text-[var(--muted)]">
                                        <svg className="w-5 h-5 text-[var(--primary)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {service}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Workshop Images Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="aspect-square bg-gradient-to-br from-[#d4c5a9] to-[#b8a67d] rounded-lg flex items-center justify-center">
                                <svg className="w-12 h-12 text-[var(--background)]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                            <div className="aspect-square bg-gradient-to-br from-[#c9b896] to-[#a89670] rounded-lg flex items-center justify-center">
                                <svg className="w-12 h-12 text-[var(--background)]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </div>
                            <div className="aspect-square bg-gradient-to-br from-[#d8cbb5] to-[#bfae8e] rounded-lg flex items-center justify-center">
                                <svg className="w-12 h-12 text-[var(--background)]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <div className="aspect-square bg-gradient-to-br from-[#cabfa8] to-[#a99882] rounded-lg flex items-center justify-center">
                                <svg className="w-12 h-12 text-[var(--background)]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="py-12 bg-[var(--primary)] relative z-[5]" style={{ isolation: 'isolate' }}>
                <div className="container-elegant">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-[var(--background)]">
                        <div>
                            <span className="text-4xl font-bold">30+</span>
                            <p className="mt-1 text-sm opacity-80">{t('stats.experience')}</p>
                        </div>
                        <div>
                            <span className="text-4xl font-bold">500+</span>
                            <p className="mt-1 text-sm opacity-80">{t('stats.pieces')}</p>
                        </div>
                        <div>
                            <span className="text-4xl font-bold">200+</span>
                            <p className="mt-1 text-sm opacity-80">{t('stats.satisfaction')}</p>
                        </div>
                        <div>
                            <span className="text-4xl font-bold">15</span>
                            <p className="mt-1 text-sm opacity-80">{t('stats.shipping')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}
