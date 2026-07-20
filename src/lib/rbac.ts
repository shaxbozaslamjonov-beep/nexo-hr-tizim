import type { UserRole } from '@/types';

export type Action =
  | 'view_hr_dashboard'
  | 'view_employee_dashboard'
  | 'view_candidate_dashboard'
  | 'manage_vacancies'
  | 'approve_vacancies'
  | 'manage_employees'
  | 'manage_candidates'
  | 'manage_settings'
  | 'view_analytics';

const PERMISSIONS: Record<UserRole, Action[]> = {
  ADMIN: [
    'view_hr_dashboard',
    'view_employee_dashboard',
    'manage_vacancies',
    'approve_vacancies',
    'manage_employees',
    'manage_candidates',
    'manage_settings',
    'view_analytics',
  ],
  DIRECTOR: [
    'view_hr_dashboard',
    'view_employee_dashboard',
    'manage_vacancies',
    'approve_vacancies',
    'manage_employees',
    'manage_candidates',
    'view_analytics',
  ],
  HR_MANAGER: [
    'view_hr_dashboard',
    'view_employee_dashboard',
    'manage_vacancies',
    'manage_candidates',
    'view_analytics',
  ],
  DEPARTMENT_HEAD: [
    'view_hr_dashboard',
    'view_employee_dashboard',
    'manage_vacancies',
    'view_analytics',
  ],
  EMPLOYEE: [
    'view_employee_dashboard',
  ],
  CANDIDATE: [
    'view_candidate_dashboard',
  ],
};

type RoleLike = { role?: string | null } | string | null | undefined;

function roleOf(user: RoleLike): string | undefined {
  if (!user) return undefined;
  return typeof user === 'string' ? user : (user.role ?? undefined);
}

/** Central permission check — use instead of ad-hoc `role === 'ADMIN'` comparisons. */
export function can(user: RoleLike, action: Action): boolean {
  const role = roleOf(user)?.toUpperCase() as UserRole | undefined;
  if (!role) return false;
  return PERMISSIONS[role]?.includes(action) ?? false;
}

/** Check whether a user has one of the given roles. */
export function hasRole(user: RoleLike, ...roles: UserRole[]) {
  const role = roleOf(user)?.toUpperCase();
  if (!role) return false;
  return roles.includes(role as UserRole);
}

export function rolesWithPermission(action: Action): UserRole[] {
  return (Object.keys(PERMISSIONS) as UserRole[]).filter((role) => PERMISSIONS[role].includes(action));
}
