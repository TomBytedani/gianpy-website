'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useLocale } from 'next-intl';

type User = {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: string;
};

type Props = {
    user: User;
};

export default function AdminHeader({ user }: Props) {
    const locale = useLocale();

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-[var(--surface)] border-b border-[var(--border)] z-50">
            <div className="h-full px-4 lg:px-6 flex items-center justify-between">
                {/* Logo / Brand */}
                <div className="flex items-center gap-4">
                    <Link href={`/${locale}/admin`} className="flex items-center gap-2">
                        <span className="font-display text-xl text-[var(--primary)]">
                            Antichità Barbaglia
                        </span>
                        <span className="px-2 py-0.5 bg-[var(--primary)] text-white text-xs font-body uppercase tracking-wider rounded">
                            Admin
                        </span>
                    </Link>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <button
                        type="button"
                        className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors relative"
                        aria-label="Notifications"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {/* Notification badge */}
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User Menu */}
                    <div className="flex items-center gap-3">
                        <div className="hidden md:block text-right">
                            <p className="font-body text-sm text-[var(--foreground)]">
                                {user.name || user.email}
                            </p>
                            <p className="text-xs text-[var(--muted)]">
                                {user.role}
                            </p>
                        </div>

                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-body text-sm">
                            {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                        </div>

                        {/* Sign Out */}
                        <button
                            type="button"
                            onClick={() => signOut({ callbackUrl: `/${locale}` })}
                            className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                            aria-label="Sign out"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
