import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
    // Match only internationalized pathnames
    // Exclude API routes, static files, etc.
    matcher: [
        // Match all pathnames except for
        // - api routes
        // - _next (Next.js internals)
        // - Static files with extensions
        '/((?!api|_next|.*\\..*).*)',
    ],
};
