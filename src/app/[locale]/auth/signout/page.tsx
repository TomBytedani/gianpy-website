'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui';
import { useTranslations } from 'next-intl';

export default function SignOutPage() {
    const t = useTranslations('auth');

    useEffect(() => {
        // Automatically sign out and redirect to home
        signOut({ callbackUrl: '/' });
    }, []);

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
                                        className="w-10 h-10 text-[var(--primary)] animate-spin"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                </div>

                                <h1 className="text-2xl text-[var(--foreground)] font-display">
                                    {t('signOut')}...
                                </h1>
                                <p className="mt-4 text-[var(--muted)] font-body">
                                    {t('signingOut')}
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
