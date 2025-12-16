'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, Button, Input } from '@/components/ui';
import { useTranslations } from 'next-intl';

export default function SignInPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const t = useTranslations('auth');

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signIn('resend', { email, callbackUrl: '/' });
            setEmailSent(true);
        } catch (error) {
            console.error('Sign in error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        signIn('google', { callbackUrl: '/' });
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Header />

            <main className="pt-28 pb-20">
                <div className="container-elegant">
                    <div className="max-w-md mx-auto">
                        <Card padding="lg">
                            <div className="text-center mb-8">
                                <span className="font-script text-2xl text-[var(--primary)] block mb-2">
                                    {t('welcome')}
                                </span>
                                <h1 className="text-2xl text-[var(--foreground)]">{t('signIn')}</h1>
                                <p className="mt-2 text-sm text-[var(--muted)]">
                                    {t('signInDescription')}
                                </p>
                            </div>

                            {emailSent ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                                        <svg
                                            className="w-8 h-8 text-[var(--primary)]"
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
                                    <h3 className="text-lg font-display italic text-[var(--foreground)]">
                                        {t('checkEmail')}
                                    </h3>
                                    <p className="mt-2 text-sm text-[var(--muted)]">
                                        {t('emailSentMessage', { email })}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Google Sign In */}
                                    <Button
                                        variant="secondary"
                                        className="w-full mb-6"
                                        onClick={handleGoogleSignIn}
                                    >
                                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                            <path
                                                fill="currentColor"
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                        </svg>
                                        {t('continueWithGoogle')}
                                    </Button>

                                    {/* Divider */}
                                    <div className="relative my-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-[var(--border)]" />
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-4 bg-[var(--background)] text-[var(--muted)]">
                                                {t('or')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Email Sign In */}
                                    <form onSubmit={handleEmailSignIn} className="space-y-4">
                                        <Input
                                            label={t('email')}
                                            type="email"
                                            placeholder={t('emailPlaceholder')}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                                            {isLoading ? t('sending') : t('sendMagicLink')}
                                        </Button>
                                    </form>

                                    <p className="mt-6 text-center text-xs text-[var(--muted)]">
                                        {t('termsAcceptance')}{' '}
                                        <a href="/terms" className="text-[var(--primary)] hover:underline">
                                            {t('termsOfService')}
                                        </a>{' '}
                                        {t('and')}{' '}
                                        <a href="/privacy" className="text-[var(--primary)] hover:underline">
                                            {t('privacyPolicy')}
                                        </a>
                                    </p>
                                </>
                            )}
                        </Card>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

