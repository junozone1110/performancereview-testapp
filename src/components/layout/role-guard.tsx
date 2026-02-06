'use client';

import { useSession } from 'next-auth/react';
import { Role } from '@/types/enums';
import { hasAnyRole, hasPermission, Permission } from '@/lib/permissions';
import { ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: Role[];
  requiredPermission?: Permission;
  fallback?: ReactNode;
}

export function RoleGuard({
  children,
  allowedRoles,
  requiredPermission,
  fallback = null,
}: RoleGuardProps) {
  const { data: session } = useSession();
  const userRoles = session?.user?.roles ?? [];

  // ロールが指定されている場合はロールチェック
  if (allowedRoles && !hasAnyRole(userRoles, allowedRoles)) {
    return <>{fallback}</>;
  }

  // パーミッションが指定されている場合はパーミッションチェック
  if (requiredPermission && !hasPermission(userRoles, requiredPermission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
