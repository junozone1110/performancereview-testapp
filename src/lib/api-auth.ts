import { auth } from '@/lib/auth';
import { Role } from '@/types/enums';
import { NextResponse } from 'next/server';
import { hasAnyRole, hasPermission, Permission } from './permissions';

export async function getAuthSession() {
  const session = await auth();
  return session;
}

export async function requireAuth() {
  const session = await getAuthSession();
  if (!session?.user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      session: null,
    };
  }
  return { error: null, session };
}

export async function requireRole(roles: Role[]) {
  const { error, session } = await requireAuth();
  if (error) return { error, session: null };

  if (!hasAnyRole(session!.user.roles, roles)) {
    return {
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
      session: null,
    };
  }

  return { error: null, session };
}

export async function requirePermission(permission: Permission) {
  const { error, session } = await requireAuth();
  if (error) return { error, session: null };

  if (!hasPermission(session!.user.roles, permission)) {
    return {
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
      session: null,
    };
  }

  return { error: null, session };
}
