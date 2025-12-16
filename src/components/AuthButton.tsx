'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export function AuthButton() {
    const { data: session, status } = useSession();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const tAuth = useTranslations('auth');
    const tAccount = useTranslations('account');

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (status === 'loading') {
        return (
            <div className="w-8 h-8 rounded-full bg-[var(--border)] animate-pulse" />
        );
    }

    if (!session) {
        return (
            <Link
                href="/auth/signin"
                className="font-body text-sm text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
            >
                {tAuth('signIn')}
            </Link>
        );
    }

    const userInitial = session.user?.name?.[0] || session.user?.email?.[0] || '?';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-[var(--background-alt)] transition-colors"
                aria-label="Account menu"
            >
                {session.user?.image ? (
                    <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="w-8 h-8 rounded-full object-cover border border-[var(--border)]"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-sm font-medium uppercase">
                        {userInitial}
                    </div>
                )}
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-[var(--background)] border border-[var(--border)] animate-fade-in z-50">
                    <div className="py-1">
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-[var(--border)]">
                            <p className="text-sm font-medium text-[var(--foreground)]">
                                {session.user?.name || 'User'}
                            </p>
                            <p className="text-xs text-[var(--muted)] truncate">
                                {session.user?.email}
                            </p>
                        </div>

                        {/* Menu items */}
                        <Link
                            href="/account"
                            className="block px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-alt)] transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                        >
                            {tAuth('myAccount')}
                        </Link>
                        <Link
                            href="/account/wishlist"
                            className="block px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-alt)] transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                        >
                            {tAccount('nav.wishlist')}
                        </Link>
                        <Link
                            href="/account/orders"
                            className="block px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-alt)] transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                        >
                            {tAccount('nav.orders')}
                        </Link>

                        {/* Admin link (only for admins) */}
                        {session.user?.role === 'ADMIN' && (
                            <>
                                <div className="border-t border-[var(--border)] my-1" />
                                <Link
                                    href="/admin"
                                    className="block px-4 py-2 text-sm text-[var(--primary)] hover:bg-[var(--background-alt)] transition-colors"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    Admin
                                </Link>
                            </>
                        )}

                        {/* Sign out */}
                        <div className="border-t border-[var(--border)] my-1" />
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="w-full text-left px-4 py-2 text-sm text-[var(--accent)] hover:bg-[var(--background-alt)] transition-colors"
                        >
                            {tAuth('signOut')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AuthButton;

