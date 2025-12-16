'use client';

import { Link, usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface AccountSidebarProps {
    children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountSidebarProps) {
    const pathname = usePathname();
    const t = useTranslations('account');

    const navItems = [
        {
            href: '/account',
            label: t('nav.dashboard'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            href: '/account/orders',
            label: t('nav.orders'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            )
        },
        {
            href: '/account/wishlist',
            label: t('nav.wishlist'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            )
        },
        {
            href: '/account/settings',
            label: t('nav.settings'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        },
    ];

    const isActive = (href: string) => {
        // Exact match for dashboard
        if (href === '/account' && pathname === '/account') {
            return true;
        }
        // Prefix match for other pages
        if (href !== '/account' && pathname.startsWith(href)) {
            return true;
        }
        return false;
    };

    return (
        <>
            <Header />
            <main className="min-h-screen bg-background pt-28 pb-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar Navigation */}
                        <aside className="lg:col-span-1">
                            <nav className="bg-white rounded-lg border border-border shadow-sm overflow-hidden sticky top-24">
                                <div className="p-4 border-b border-border bg-background-alt">
                                    <h2 className="font-display italic text-lg text-foreground">
                                        {t('title')}
                                    </h2>
                                </div>
                                <ul className="py-2">
                                    {navItems.map((item) => (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                className={`
                                                    flex items-center gap-3 px-4 py-3 font-body text-sm transition-colors
                                                    ${isActive(item.href)
                                                        ? 'bg-primary/10 text-primary border-r-2 border-primary'
                                                        : 'text-foreground hover:bg-background-alt'
                                                    }
                                                `}
                                            >
                                                {item.icon}
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                <div className="p-4 border-t border-border">
                                    <Link
                                        href="/auth/signout"
                                        className="flex items-center gap-3 text-muted hover:text-red-600 transition-colors font-body text-sm"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        {t('nav.signOut')}
                                    </Link>
                                </div>
                            </nav>
                        </aside>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            {children}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
