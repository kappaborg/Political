import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('Middleware running for path:', pathname);
  
  // Admin sayfalarını koru
  if (pathname.startsWith('/admin') && !pathname.includes('/admin/login')) {
    console.log('Protecting admin path:', pathname);
    
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET || "supersecretkey123" });
    
    console.log('Auth token:', token);

    // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
    if (!token) {
      console.log('No token found, redirecting to login');
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Admin rolü kontrolü de ekleyebiliriz
    if (token.role !== 'admin') {
      console.log('User is not admin, redirecting to login');
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    console.log('Access granted to admin path for user:', token.username);
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