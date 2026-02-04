import { Role } from '@prisma/client';

export type Permission =
  | 'view_own_sheet'
  | 'edit_own_goals'
  | 'edit_own_self_evaluation'
  | 'view_team_sheets'
  | 'edit_team_evaluation'
  | 'view_all_sheets'
  | 'edit_all_sheets'
  | 'manage_periods'
  | 'manage_imports'
  | 'manage_viewers';

export const rolePermissions: Record<Role, Permission[]> = {
  employee: ['view_own_sheet', 'edit_own_goals', 'edit_own_self_evaluation'],
  manager: [
    'view_own_sheet',
    'edit_own_goals',
    'edit_own_self_evaluation',
    'view_team_sheets',
    'edit_team_evaluation',
  ],
  hr: [
    'view_own_sheet',
    'edit_own_goals',
    'edit_own_self_evaluation',
    'view_all_sheets',
    'edit_all_sheets',
    'manage_periods',
    'manage_imports',
    'manage_viewers',
  ],
};

export function hasPermission(roles: Role[], permission: Permission): boolean {
  return roles.some((role) => rolePermissions[role]?.includes(permission));
}

export function hasRole(roles: Role[], targetRole: Role): boolean {
  return roles.includes(targetRole);
}

export function hasAnyRole(roles: Role[], targetRoles: Role[]): boolean {
  return targetRoles.some((targetRole) => roles.includes(targetRole));
}

export function getHighestRole(roles: Role[]): Role {
  if (roles.includes('hr')) return 'hr';
  if (roles.includes('manager')) return 'manager';
  return 'employee';
}
