import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/jwt';

const publicRoutes = ['/login', '/register', '/', '/api/auth/login', '/api/auth/register'];

// Role based access patterns can be defined here
const roleAccessMap: Record<string, string[]> = {
  '/dashboard/hr': ['HR_MANAGER', 'ADMIN', 'DIRECTOR'],
  '/dashboard/employee': ['EMPLOYEE', 'HR_MANAGER', 'ADMIN', 'DEPARTMENT_HEAD', 'DIRECTOR'],
  '/dashboard/admin': ['ADMIN'],
  '/dashboard/director': ['DIRECTOR', 'ADMIN'],
  '/dashboard/manager': ['DEPARTMENT_HEAD', 'ADMIN'],
  '/dashboard/candidate': ['CANDIDATE', 'ADMIN'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isPublicRoute = publicRoutes.includes(pathname) || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/public') ||
    pathname === '/favicon.ico';

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifyToken(token);

  if (!payload) {
    // Invalid token
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    return response;
  }

  // Check RBAC
  for (const [route, allowedRoles] of Object.entries(roleAccessMap)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(payload.role)) {
        // User not authorized for this route
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/public (API routes that are public)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
