import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/jwt';
import { rolesWithPermission, type Action } from './lib/rbac';

const publicRoutes = ['/login', '/register', '/', '/api/auth/login', '/api/auth/register'];
// Prefixes that are always public regardless of HTTP method
const publicRoutePrefixes = ['/apply', '/login'];
// Routes public only for specific HTTP methods (e.g. anonymous candidate self-submission)
const publicMethodRoutes: Record<string, string[]> = {
  '/api/candidates': ['POST'],
};

// Route -> permission required. Allowed roles are derived from the central RBAC module
// (src/lib/rbac.ts) so route gating always matches the permissions used elsewhere in the app.
const routePermissions: Record<string, Action> = {
  '/dashboard/hr': 'view_hr_dashboard',
  '/dashboard/employee': 'view_employee_dashboard',
  '/dashboard/candidate': 'view_candidate_dashboard',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isPublicRoute = publicRoutes.includes(pathname) ||
    publicRoutePrefixes.some((p) => pathname.startsWith(p)) ||
    (publicMethodRoutes[pathname]?.includes(request.method)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/public') ||
    pathname.startsWith('/api/webhooks') ||
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
  for (const [route, action] of Object.entries(routePermissions)) {
    if (pathname.startsWith(route)) {
      const allowedRoles = rolesWithPermission(action);
      if (!allowedRoles.includes(payload.role as import('./types').UserRole)) {
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
