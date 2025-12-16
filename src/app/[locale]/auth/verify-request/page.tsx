import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui';
import { useTranslations } from 'next-intl';

export default function VerifyRequestPage() {
    const t = useTranslations('auth');

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Header />

            <main className="pt-28 pb-20">
                <div className="container-elegant">
                    <div className="max-w-md mx-auto">
                        <Card padding="lg">
                            <div className="text-center py-8">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                                    <svg
                                        className="w-10 h-10 text-[var(--primary)]"
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

                                <span className="font-script text-2xl text-[var(--primary)] block mb-2">
                                    {t('almostThere')}
                                </span>
                                <h1 className="text-2xl text-[var(--foreground)]">
                                    {t('checkYourEmail')}
                                </h1>

                                <p className="mt-4 text-[var(--muted)]">
                                    {t('magicLinkSent')}
                                </p>

                                <div className="mt-8 p-4 bg-[var(--background-alt)] rounded-lg">
                                    <p className="text-sm text-[var(--muted)]">
                                        <strong className="text-[var(--foreground)]">{t('emailNotReceived')}</strong>
                                        <br />
                                        {t('checkSpamFolder')}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
