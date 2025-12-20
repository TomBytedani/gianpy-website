'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { CartProvider } from '@/lib/cart';
import { SiteSettingsProvider } from '@/hooks/useSiteSettings';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <SessionProvider>
            <SiteSettingsProvider>
                <CartProvider>{children}</CartProvider>
            </SiteSettingsProvider>
        </SessionProvider>
    );
}

export default Providers;
