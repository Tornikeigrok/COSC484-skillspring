import type { User } from '../../../lib/types';

export function getRedirectTarget(next: string | null, current: User) {
  return next?.startsWith('/') && !next.startsWith('//') && !next.includes('\\')
    ? next
    : current.role === 'student'
      ? '/student'
      : '/business';
}
