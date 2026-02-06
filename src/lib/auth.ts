import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import type { Role } from '@/types/enums';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      employeeNumber: string;
      roles: (Role | string)[];
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    employeeNumber: string;
    roles: (Role | string)[];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    // メールアドレスでログイン（モックアップ用）
    Credentials({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        if (!email) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { roles: true },
        });

        if (!user || !user.isActive) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          employeeNumber: user.employeeNumber,
          roles: user.roles.map((r) => r.role),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.employeeNumber = user.employeeNumber;
        token.roles = user.roles;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.employeeNumber = token.employeeNumber as string;
        session.user.roles = token.roles as (Role | string)[];
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});
