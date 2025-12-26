'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, Button } from '@/components/ui';
import { BaroquePattern } from '@/components/BaroquePattern';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

// R2 public URL for static assets
const R2_PUBLIC_URL = 'https://pub-c08ae0de86f94e598029df0900cc46b3.r2.dev';

export default function ServicesPage() {
    const t = useTranslations('services');
    const tCommon = useTranslations('common.buttons');

    // Smooth scroll to section
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-28 pb-16 bg-[var(--background-alt)] overflow-hidden" style={{ isolation: 'isolate' }}>
                {/* Subtle decorative background */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ contain: 'strict', clipPath: 'inset(0)' }}>
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" shapeRendering="crispEdges">
                        <defs>
                            <pattern id="flourish-services" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                                <path
                                    d="M25 0C25 13.8 13.8 25 0 25C13.8 25 25 36.2 25 50C25 36.2 36.2 25 50 25C36.2 25 25 13.8 25 0Z"
                                    fill="var(--primary)"
                                />
                            </pattern>
                        </defs>
                        <rect x="0" y="0" width="100" height="100" fill="url(#flourish-services)" />
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

            {/* Quick Navigation Grid */}
            <section className="py-12 bg-[var(--background)]">
                <div className="container-elegant">
                    <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
                        {/* Restauro Card */}
                        <button
                            onClick={() => scrollToSection('restauro')}
                            className="group p-6 bg-[var(--surface)] rounded-xl border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300 hover:shadow-lg text-left"
                        >
                            <div className="w-14 h-14 mb-4 rounded-full bg-[var(--primary)]/10 flex items-center justify-center group-hover:bg-[var(--primary)]/20 transition-colors">
                                <svg className="w-7 h-7 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                                </svg>
                            </div>
                            <h3 className="font-display text-xl text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{t('quickNav.restauro')}</h3>
                            <svg className="w-5 h-5 text-[var(--muted)] mt-2 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </button>

                        {/* Manifattura Card */}
                        <button
                            onClick={() => scrollToSection('manifattura')}
                            className="group p-6 bg-[var(--surface)] rounded-xl border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300 hover:shadow-lg text-left"
                        >
                            <div className="w-14 h-14 mb-4 rounded-full bg-[var(--primary)]/10 flex items-center justify-center group-hover:bg-[var(--primary)]/20 transition-colors">
                                <svg className="w-7 h-7 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </div>
                            <h3 className="font-display text-xl text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{t('quickNav.manifattura')}</h3>
                            <svg className="w-5 h-5 text-[var(--muted)] mt-2 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </button>

                        {/* Compra-Vendita Card */}
                        <button
                            onClick={() => scrollToSection('compravendita')}
                            className="group p-6 bg-[var(--surface)] rounded-xl border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300 hover:shadow-lg text-left"
                        >
                            <div className="w-14 h-14 mb-4 rounded-full bg-[var(--primary)]/10 flex items-center justify-center group-hover:bg-[var(--primary)]/20 transition-colors">
                                <svg className="w-7 h-7 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                            <h3 className="font-display text-xl text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{t('quickNav.compravendita')}</h3>
                            <svg className="w-5 h-5 text-[var(--muted)] mt-2 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </section>

            {/* Service Strip 1: Restauro */}
            <section id="restauro" className="py-20 bg-[var(--background)] scroll-mt-20">
                <div className="container-elegant">
                    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                        {/* Left: Text Content */}
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="font-display text-2xl text-[var(--primary)]">{t('restauro.title')}</span>
                                </div>
                            </div>
                            <p className="text-[var(--muted)] leading-relaxed text-lg">
                                {t('restauro.description')}
                            </p>
                        </div>

                        {/* Right: Before/After Images */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <div className="absolute top-3 left-3 bg-[var(--background)]/90 backdrop-blur-sm px-3 py-1 rounded-full border border-[var(--border)] z-10">
                                    <span className="text-sm font-medium text-[var(--foreground)]">{t('restauro.prima')}</span>
                                </div>
                                <div className="aspect-[3/4] bg-gradient-to-br from-[#c9b896] to-[#a89670] rounded-xl overflow-hidden">
                                    <img
                                        src={`${R2_PUBLIC_URL}/porta-prima.jpeg`}
                                        alt={t('restauro.prima')}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute top-3 left-3 bg-[var(--primary)] px-3 py-1 rounded-full z-10">
                                    <span className="text-sm font-medium text-white">{t('restauro.dopo')}</span>
                                </div>
                                <div className="aspect-[3/4] bg-gradient-to-br from-[#d4c5a9] to-[#b8a67d] rounded-xl overflow-hidden">
                                    <img
                                        src={`${R2_PUBLIC_URL}/porta-dopo.jpeg`}
                                        alt={t('restauro.dopo')}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Service Strip 2: Manifattura */}
            <section id="manifattura" className="py-20 bg-[var(--background-alt)] scroll-mt-20">
                <BaroquePattern position="all" opacity={0.03} />
                <div className="container-elegant">
                    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                        {/* Left: Image placeholder */}
                        <div className="order-2 lg:order-1">
                            <div className="aspect-[4/3] bg-gradient-to-br from-[#d8cbb5] to-[#bfae8e] rounded-xl overflow-hidden flex items-center justify-center relative">
                                <div className="absolute -bottom-4 -left-4 w-full h-full border-2 border-[var(--primary)] rounded-xl -z-10" />
                                <svg className="w-20 h-20 text-[var(--background)]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                </svg>
                            </div>
                        </div>

                        {/* Right: Text Content */}
                        <div className="order-1 lg:order-2">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="font-display text-2xl text-[var(--primary)]">{t('manifattura.title')}</span>
                                </div>
                            </div>
                            <p className="text-[var(--muted)] leading-relaxed text-lg">
                                {t('manifattura.description')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Service Strip 3: Compra-Vendita */}
            <section id="compravendita" className="py-20 bg-[var(--background)] scroll-mt-20">
                <div className="container-elegant">
                    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                        {/* Left: Text Content */}
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="font-display text-2xl text-[var(--primary)]">{t('compravendita.title')}</span>
                                </div>
                            </div>
                            <p className="text-[var(--muted)] leading-relaxed text-lg">
                                {t('compravendita.description')}
                            </p>
                            <Link href="/shop" className="inline-block mt-6">
                                <Button variant="primary">
                                    {t('cta.viewCollection')} →
                                </Button>
                            </Link>
                        </div>

                        {/* Right: Image grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="aspect-square bg-gradient-to-br from-[#d4c5a9] to-[#b8a67d] rounded-lg flex items-center justify-center">
                                <svg className="w-12 h-12 text-[var(--background)]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                </svg>
                            </div>
                            <div className="aspect-square bg-gradient-to-br from-[#c9b896] to-[#a89670] rounded-lg flex items-center justify-center">
                                <svg className="w-12 h-12 text-[var(--background)]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <div className="col-span-2 aspect-[2/1] bg-gradient-to-br from-[#cabfa8] to-[#a99882] rounded-lg flex items-center justify-center">
                                <svg className="w-16 h-16 text-[var(--background)]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Floating Contact Button */}
            <Link
                href="/contact"
                className="fixed bottom-6 right-6 z-50 bg-[var(--primary)] text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group hover:brightness-110 hover:scale-105"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="font-medium">{t('cta.contact')}</span>
            </Link>

            {/* Footer */}
            <Footer />
        </div>
    );
}
