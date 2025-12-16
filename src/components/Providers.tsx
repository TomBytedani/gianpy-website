'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { CartProvider } from '@/lib/cart';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <SessionProvider>
            <CartProvider>{children}</CartProvider>
        </SessionProvider>
    );
}

export default Providers;
