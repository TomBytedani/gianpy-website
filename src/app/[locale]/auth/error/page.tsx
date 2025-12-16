'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, Button } from '@/components/ui';

const errorMessages: Record<string, { title: string; message: string }> = {
    default: {
        title: 'Errore di autenticazione',
        message: "Si è verificato un errore durante l'accesso. Riprova.",
    },
    configuration: {
        title: 'Errore di configurazione',
        message: 'Il sistema di autenticazione non è configurato correttamente.',
    },
    accessdenied: {
        title: 'Accesso negato',
        message: 'Non hai i permessi per accedere a questa risorsa.',
    },
    verification: {
        title: 'Link scaduto',
        message: 'Il link magico è scaduto o è già stato utilizzato. Richiedi un nuovo link.',
    },
};

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error') || 'default';

    const { title, message } = errorMessages[error.toLowerCase()] || errorMessages.default;

    return (
        <>
            <h1 className="text-2xl text-[var(--foreground)]">{title}</h1>
            <p className="mt-4 text-[var(--muted)]">{message}</p>
        </>
    );
}

function ErrorContentFallback() {
    const { title, message } = errorMessages.default;
    return (
        <>
            <h1 className="text-2xl text-[var(--foreground)]">{title}</h1>
            <p className="mt-4 text-[var(--muted)]">{message}</p>
        </>
    );
}

export default function AuthErrorPage() {
    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Header />

            <main className="pt-28 pb-20">
                <div className="container-elegant">
                    <div className="max-w-md mx-auto">
                        <Card padding="lg">
                            <div className="text-center py-8">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                                    <svg
                                        className="w-10 h-10 text-[var(--accent)]"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        />
                                    </svg>
                                </div>

                                <Suspense fallback={<ErrorContentFallback />}>
                                    <ErrorContent />
                                </Suspense>

                                <div className="mt-8 space-y-3">
                                    <Link href="/auth/signin">
                                        <Button variant="primary" className="w-full">
                                            Riprova
                                        </Button>
                                    </Link>
                                    <Link href="/">
                                        <Button variant="ghost" className="w-full">
                                            Torna alla Home
                                        </Button>
                                    </Link>
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
