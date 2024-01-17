import NextAuth from 'next-auth/next';
import { authOptions } from './options.js';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
