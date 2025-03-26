import { AuthOptions } from 'next-auth';
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
const debug = process.env.NODE_ENV === 'development';

if (debug) {
  console.log('Auth options loaded, NODE_ENV:', process.env.NODE_ENV);
  console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
  console.log('NEXTAUTH_SECRET present:', !!process.env.NEXTAUTH_SECRET);
}

// Auth options
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        try {
          if (debug) {
            console.log('Authorize called with credentials:', {
              username: credentials?.username,
              hasPassword: !!credentials?.password
            });
          }

          if (!credentials?.username || !credentials?.password) {
            throw new Error('Missing credentials');
          }

          // Demo credentials check
          if (credentials.username === 'admin' && credentials.password === 'password123') {
            const user = {
              id: '1',
              name: 'Admin User',
              email: 'admin@example.com',
              username: 'admin',
              role: 'admin'
            };
            
            if (debug) {
              console.log('User authenticated:', user);
            }
            
            return user;
          }

          if (debug) {
            console.log('Invalid credentials provided');
          }
          
          return null;
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.username = token.username as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  debug: process.env.NODE_ENV === 'development',
}; 