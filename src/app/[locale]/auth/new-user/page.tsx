'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, Button } from '@/components/ui';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';

function NewUserContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const t = useTranslations('auth');
    const [countdown, setCountdown] = useState(5);

    const callbackUrl = searchParams.get('callbackUrl') || '/';

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.push(callbackUrl);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [callbackUrl, router]);

    return (
        <>
            <h1 className="text-2xl text-[var(--foreground)] font-display">
                {t('welcome')}, {session?.user?.name?.split(' ')[0] || t('newUser')}!
            </h1>
            <p className="mt-4 text-[var(--muted)] font-body">
                {t('accountCreated')}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)] font-body">
                {t('redirectingIn', { seconds: countdown })}
            </p>
            <div className="mt-8">
                <Button
                    variant="primary"
                    onClick={() => router.push(callbackUrl)}
                    className="w-full"
                >
                    {t('continueToSite')}
                </Button>
            </div>
        </>
    );
}

function NewUserContentFallback() {
    const t = useTranslations('auth');
    return (
        <>
            <h1 className="text-2xl text-[var(--foreground)] font-display">
                {t('welcome')}!
            </h1>
            <p className="mt-4 text-[var(--muted)] font-body">
                {t('accountCreated')}
            </p>
        </>
    );
}

export default function NewUserPage() {
    const t = useTranslations('auth');

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Header />

            <main className="pt-28 pb-20">
                <div className="container-elegant">
                    <div className="max-w-md mx-auto">
                        <Card padding="lg">
                            <div className="text-center py-8">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                                    <svg
                                        className="w-10 h-10 text-green-600"
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

                                <Suspense fallback={<NewUserContentFallback />}>
                                    <NewUserContent />
                                </Suspense>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
