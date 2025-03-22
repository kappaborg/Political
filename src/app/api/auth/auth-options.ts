import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Mock user database
const users = [
  {
    id: '1',
    name: 'Administrator',
    username: 'admin',
    password: 'password123', // In a real app, this would be hashed
    role: 'admin',
  },
];

// For debugging
console.log('Auth options loaded, NODE_ENV:', process.env.NODE_ENV);
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('NEXTAUTH_SECRET present:', !!process.env.NEXTAUTH_SECRET);

// Auth options
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('Authorizing credentials:', credentials?.username);
        
        if (!credentials?.username || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        // Find user
        const user = users.find(
          (user) => user.username === credentials.username && 
                    user.password === credentials.password
        );

        if (user) {
          console.log('User authenticated:', user.username, 'with role:', user.role);
          return {
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role,
          };
        }

        console.log('User not found or invalid credentials');
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT callback called', { hasUser: !!user, token: JSON.stringify(token) });
      
      if (user) {
        console.log('Adding user data to token');
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      console.log('Session callback called', { hasToken: !!token });
      
      if (session.user) {
        console.log('Adding token data to session');
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  // NextAuth oturum ve cookie ayarları
  secret: process.env.NEXTAUTH_SECRET || "emina-web-jwt-secret-key-with-minimum-32-chars",
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  debug: true,  // Always enable debug mode
}; 