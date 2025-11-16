import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/courses/enrolled',
  '/profile',
  '/settings',
  '/bootcamps/my-bootcamps',
];

// Define public routes (even if logged in, these are accessible)
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/courses',
  '/about',
];

// Admin only routes
const adminRoutes = ['/admin'];

// Instructor routes
const instructorRoutes = ['/instructor'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token from cookies
  const token = request.cookies.get('accessToken')?.value;
  const userRole = request.cookies.get('userRole')?.value;

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isInstructorRoute = instructorRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Redirect to login if accessing a protected route without a token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin routes
  if (isAdminRoute && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Check instructor routes
  if (
    isInstructorRoute &&
    userRole !== 'INSTRUCTOR' &&
    userRole !== 'ADMIN'
  ) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Redirect to dashboard if accessing login/register while already authenticated
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
