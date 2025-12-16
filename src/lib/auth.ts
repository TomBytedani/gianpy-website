import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import Resend from 'next-auth/providers/resend';
import { prisma } from '@/lib/prisma';
import type { NextAuthConfig } from 'next-auth';
import type { UserRole } from '@/generated/prisma';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            name?: string | null;
            image?: string | null;
            role: UserRole;
        };
    }

    interface User {
        role?: UserRole;
    }
}

declare module '@auth/core/jwt' {
    interface JWT {
        id?: string;
        role?: UserRole;
    }
}

export const authConfig: NextAuthConfig = {
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Resend({
            apiKey: process.env.RESEND_API_KEY,
            from: process.env.EMAIL_FROM || 'noreply@bottegadelrestauro.it',
        }),
    ],
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout',
        error: '/auth/error',
        verifyRequest: '/auth/verify-request',
        newUser: '/auth/new-user',
    },
    callbacks: {
        async session({ session, user }) {
            if (user) {
                session.user.id = user.id;
                session.user.role = user.role || 'CUSTOMER';
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
    },
    session: {
        strategy: 'database',
    },
    debug: process.env.NODE_ENV === 'development',
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
