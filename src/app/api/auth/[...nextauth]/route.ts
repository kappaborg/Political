import NextAuth from 'next-auth';
import { authOptions } from '../auth-options';

// Next.js App Router için handler - sadece bu gerekli
const handler = NextAuth(authOptions);

// Sadece HTTP method handler'larını export et
export { handler as GET, handler as POST };
