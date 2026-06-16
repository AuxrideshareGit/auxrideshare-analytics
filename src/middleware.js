import { NextResponse } from 'next/server';

const AUTH_TOKEN_KEY = '__AUX_AUTH_TOKEN__';

// Routes that don't require authentication
const PUBLIC_PATHS = ['/login'];

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Allow Next.js internals and static files through unconditionally
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    const token = request.cookies.get(AUTH_TOKEN_KEY)?.value;
    const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

    // ✅ Already logged in → redirect away from login to dashboard
    if (isPublicPath && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // ✅ Public page, no token → allow through
    if (isPublicPath) {
        return NextResponse.next();
    }

    // ✅ Protected page, no token → redirect to login
    if (!token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths EXCEPT:
         *  - _next/static
         *  - _next/image
         *  - favicon.ico
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
