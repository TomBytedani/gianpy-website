import { auth } from '@/lib/auth';
import { UserRole } from '@/generated/prisma';

/**
 * Check if the current session user has admin privileges
 */
export async function isAdmin(): Promise<boolean> {
    const session = await auth();
    return session?.user?.role === 'ADMIN';
}

/**
 * Get current user's role
 */
export async function getUserRole(): Promise<UserRole | null> {
    const session = await auth();
    return session?.user?.role || null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
    const session = await auth();
    return !!session?.user;
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
    const session = await auth();
    return session?.user || null;
}
