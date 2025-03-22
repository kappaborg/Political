import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Admin sayfalarını koru
  if (pathname.startsWith('/admin') && !pathname.includes('/admin/login')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET || "supersecretkey123" });

    // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Admin rolü kontrolü de ekleyebiliriz
    if (token.role !== 'admin') {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Hangi isteklerin middleware'den geçeceğini belirt
export const config = {
  matcher: [
    '/admin/:path*', // Tüm admin altındaki sayfalar
  ],
}; 