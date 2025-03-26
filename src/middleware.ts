import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('Middleware running for path:', pathname);
  // Minimize excessive logging in production
  if (process.env.NODE_ENV === 'development') {
    console.log('Request URL:', request.url);
    console.log('Request headers:', JSON.stringify(Array.from(request.headers.entries())));
    console.log('Cookies:', request.cookies.getAll().map(c => `${c.name}=${c.value}`));
  }
  
  // Admin sayfaları ve API'leri için koruma
  if ((pathname.startsWith('/admin') && !pathname.includes('/admin/login')) || 
      (pathname.startsWith('/api/') && request.method !== 'GET')) {
    try {
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: process.env.NODE_ENV === 'production'
      });

      if (!token) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }
        // Use nextUrl instead of URL constructor for more reliability
        const url = request.nextUrl.clone();
        url.pathname = '/admin/login';
        return NextResponse.redirect(url);
      }

      if (token.role !== 'admin') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }
        // Use nextUrl instead of URL constructor for more reliability
        const url = request.nextUrl.clone();
        url.pathname = '/admin/login';
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error('Error in auth middleware:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware completed for path:', pathname);
  }
  return NextResponse.next();
}

// Hangi isteklerin middleware'den geçeceğini belirt
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*'
  ],
}; 