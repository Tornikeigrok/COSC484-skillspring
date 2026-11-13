import type { Assignment } from '../../../lib/types';
import { INACTIVE_ASSIGNMENT_STATUSES } from '../constants/assignment-statuses';

export function getActiveAssignments(items: Assignment[]) {
  return items.filter((a) => !INACTIVE_ASSIGNMENT_STATUSES.includes(a.status));
}
