'use client';

import { useState } from 'react';
import AuthButton from './AuthButton';
import { useCart } from '@/lib/cart';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { getItemCount, isLoading } = useCart();
    const itemCount = getItemCount();
    const locale = useLocale();
    const pathname = usePathname();
    const t = useTranslations('common');
    const currentPath = pathname || '/';

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)] border-b border-[var(--border)]">
            <div className="container-elegant">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="font-display text-xl md:text-2xl text-[var(--primary)]">
                            {t('appName')}
                        </span>
                    </Link>

                    {/* Desktop Navigation - Centered */}
                    <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                        <Link
                            href="/shop"
                            className="font-body text-sm uppercase tracking-widest text-[var(--foreground)] hover:text-[var(--primary)] transition-colors link-elegant"
                        >
                            {t('nav.shop')}
                        </Link>
                        <Link
                            href="/about"
                            className="font-body text-sm uppercase tracking-widest text-[var(--foreground)] hover:text-[var(--primary)] transition-colors link-elegant"
                        >
                            {t('nav.about')}
                        </Link>
                        <Link
                            href="/contact"
                            className="font-body text-sm uppercase tracking-widest text-[var(--foreground)] hover:text-[var(--primary)] transition-colors link-elegant"
                        >
                            {t('nav.contact')}
                        </Link>
                    </nav>

                    {/* Cart Button */}
                    <div className="flex items-center gap-4">
                        {/* Locale switcher */}
                        <div
                            className="hidden md:flex items-center rounded-full border border-[var(--border)] overflow-hidden"
                            aria-label={t('language')}
                        >
                            <Link
                                href={currentPath}
                                locale="it"
                                className={`px-3 py-1 text-xs tracking-widest transition-colors ${locale === 'it' ? 'btn-link bg-[var(--primary)] text-white font-medium' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
                            >
                                IT
                            </Link>
                            <Link
                                href={currentPath}
                                locale="en"
                                className={`px-3 py-1 text-xs tracking-widest transition-colors ${locale === 'en' ? 'btn-link bg-[var(--primary)] text-white font-medium' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
                            >
                                EN
                            </Link>
                        </div>

                        <Link
                            href="/cart"
                            className="relative p-2 text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                            aria-label={t('buttons.goToCart')}
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                />
                            </svg>
                            {/* Cart badge - shows item count */}
                            {!isLoading && itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--primary)] text-white text-xs rounded-full flex items-center justify-center">
                                    {itemCount > 99 ? '99+' : itemCount}
                                </span>
                            )}
                        </Link>

                        {/* Auth Button */}
                        <AuthButton />

                        {/* Mobile menu button */}
                        <button
                            type="button"
                            className="md:hidden p-2 text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {isMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <nav className="md:hidden py-4 border-t border-[var(--border)] animate-fade-in">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 py-2">
                                <span className="text-xs tracking-widest text-[var(--muted)]">{t('language')}</span>
                                <div className="flex items-center rounded-full border border-[var(--border)] overflow-hidden">
                                    <Link
                                        href={currentPath}
                                        locale="it"
                                        className={`px-3 py-1 text-xs tracking-widest transition-colors ${locale === 'it' ? 'btn-link bg-[var(--primary)] text-white font-medium' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        IT
                                    </Link>
                                    <Link
                                        href={currentPath}
                                        locale="en"
                                        className={`px-3 py-1 text-xs tracking-widest transition-colors ${locale === 'en' ? 'btn-link bg-[var(--primary)] text-white font-medium' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        EN
                                    </Link>
                                </div>
                            </div>
                            <Link
                                href="/shop"
                                className="font-body text-sm uppercase tracking-widest text-[var(--foreground)] hover:text-[var(--primary)] transition-colors py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t('nav.shop')}
                            </Link>
                            <Link
                                href="/about"
                                className="font-body text-sm uppercase tracking-widest text-[var(--foreground)] hover:text-[var(--primary)] transition-colors py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t('nav.about')}
                            </Link>
                            <Link
                                href="/contact"
                                className="font-body text-sm uppercase tracking-widest text-[var(--foreground)] hover:text-[var(--primary)] transition-colors py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t('nav.contact')}
                            </Link>
                        </div>
                    </nav>
                )}
            </div>
        </header>
    );
}

export default Header;
