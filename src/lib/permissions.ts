import { Role } from '@/types/enums';

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

// Note: Functions accept string to support SQLite (which stores enums as strings)
export function hasPermission(roles: (Role | string)[], permission: Permission): boolean {
  return roles.some((role) => rolePermissions[role as Role]?.includes(permission));
}

export function hasRole(roles: (Role | string)[], targetRole: Role | string): boolean {
  return roles.includes(targetRole as Role);
}

export function hasAnyRole(roles: (Role | string)[], targetRoles: (Role | string)[]): boolean {
  return targetRoles.some((targetRole) => roles.includes(targetRole as Role));
}

export function getHighestRole(roles: (Role | string)[]): Role {
  if (roles.includes('hr')) return 'hr';
  if (roles.includes('manager')) return 'manager';
  return 'employee';
}
