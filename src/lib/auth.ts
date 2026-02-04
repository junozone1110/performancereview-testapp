import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import type { Role } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      employeeNumber: string;
      roles: Role[];
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    employeeNumber: string;
    roles: Role[];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // 開発用: メールのみでログイン可能
    Credentials({
      name: 'Development',
      credentials: {
        email: { label: 'Email', type: 'email' },
      },
      async authorize(credentials) {
        if (process.env.NODE_ENV === 'production') {
          return null;
        }

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
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { roles: true },
        });

        if (!dbUser || !dbUser.isActive) {
          return false;
        }

        user.id = dbUser.id;
        user.employeeNumber = dbUser.employeeNumber;
        user.roles = dbUser.roles.map((r) => r.role);
      }
      return true;
    },
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
        session.user.roles = token.roles as Role[];
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
