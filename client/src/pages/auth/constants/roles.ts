import type { Role } from '../../../lib/types';

export const ROLES: readonly Role[] = ['student', 'company'];
export const ROLE_LABELS: Record<Role, string> = {
  student: 'I’m a student',
  company: 'I’m a business',
};
