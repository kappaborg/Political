import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('Middleware running for path:', pathname);
  console.log('Request URL:', request.url);
  console.log('Request headers:', JSON.stringify(Array.from(request.headers.entries())));
  
  // Check all cookies to debug
  console.log('Cookies:', request.cookies.getAll().map(c => `${c.name}=${c.value}`));
  
  // Admin sayfalarını koru
  if (pathname.startsWith('/admin') && !pathname.includes('/admin/login')) {
    console.log('Protecting admin path:', pathname);
    
    try {
      // Try to get token with explicit options
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET || "emina-web-jwt-secret-key-with-minimum-32-chars", 
        secureCookie: process.env.NODE_ENV === 'production',
        cookieName: 'next-auth.session-token'
      });
      
      console.log('Auth token obtained:', token);

      // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
      if (!token) {
        console.log('No token found, redirecting to login');
        const loginUrl = new URL('/admin/login', request.url);
        console.log('Redirecting to:', loginUrl.toString());
        return NextResponse.redirect(loginUrl);
      }

      // Admin rolü kontrolü
      if (token.role !== 'admin') {
        console.log('User is not admin, role:', token.role);
        const loginUrl = new URL('/admin/login', request.url);
        console.log('Redirecting to:', loginUrl.toString());
        return NextResponse.redirect(loginUrl);
      }
      
      console.log('Access granted to admin path for user:', token.username);
    } catch (error) {
      console.error('Error in auth middleware:', error);
      // On error, still allow access for debugging
      console.log('Error occurred, but allowing access for debugging');
      return NextResponse.next();
    }
  }

  console.log('Middleware completed for path:', pathname);
  return NextResponse.next();
}

// Hangi isteklerin middleware'den geçeceğini belirt
export const config = {
  matcher: [
    '/admin/:path*', // Tüm admin altındaki sayfalar
  ],
}; 