import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'therapist' | 'client';
}

interface VerifiedSession {
  user: User;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
  };
}

const publicRoutes = ['/login', '/signup'];
const therapistRoutes = ['/therapist'];
const clientRoutes = ['/client'];

async function verifySession(request: NextRequest): Promise<VerifiedSession | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const sessionCookie = request.cookies.get('better-auth.session_token');

    if (!sessionCookie) {
      return null;
    }

    const response = await fetch(`${apiUrl}/api/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `${sessionCookie.name}=${sessionCookie.value}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data as VerifiedSession;
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}

function getRoleBasedRedirect(pathname: string, userRole: 'therapist' | 'client'): string | null {
  if (userRole === 'therapist' && clientRoutes.some((route) => pathname.startsWith(route))) {
    return '/therapist/dashboard';
  }
  if (userRole === 'client' && therapistRoutes.some((route) => pathname.startsWith(route))) {
    return '/client/dashboard';
  }
  return null;
}

function getDashboardUrl(userRole: 'therapist' | 'client'): string {
  return userRole === 'therapist' ? '/therapist/dashboard' : '/client/dashboard';
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.includes(pathname);
}

function requiresAuth(pathname: string): boolean {
  return (
    therapistRoutes.some((route) => pathname.startsWith(route)) ||
    clientRoutes.some((route) => pathname.startsWith(route))
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await verifySession(request);
  const isAuthenticated = !!session;
  const userRole = session?.user?.role;

  // Authenticated users accessing / → redirect to dashboard
  if (pathname === '/' && isAuthenticated && userRole) {
    const dashboardUrl = getDashboardUrl(userRole);
    return NextResponse.redirect(new URL(dashboardUrl, request.url), 307);
  }

  // Authenticated users accessing /login or /signup → redirect to dashboard
  if (isPublicRoute(pathname) && isAuthenticated && userRole) {
    const dashboardUrl = getDashboardUrl(userRole);
    return NextResponse.redirect(new URL(dashboardUrl, request.url), 307);
  }

  // Protected routes require authentication
  if (requiresAuth(pathname) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl, 307);
  }

  // Role-based route protection
  if (isAuthenticated && userRole) {
    const redirectUrl = getRoleBasedRedirect(pathname, userRole);
    if (redirectUrl) {
      return NextResponse.redirect(new URL(redirectUrl, request.url), 307);
    }
  }

  // Handle missing role data
  if (isAuthenticated && !userRole && requiresAuth(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url), 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
