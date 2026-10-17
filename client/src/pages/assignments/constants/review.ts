import type { Review } from '../../../lib/types';

export const REVIEW_DECISION_OPTIONS: [Review['decision'], string][] = [
  ['approved', 'Approve work'],
  ['changes_requested', 'Request changes'],
  ['rejected', 'Reject and close assignment'],
];
export const REVIEW_SUBMIT_LABELS: Record<Review['decision'], string> = {
  approved: 'Approve and verify experience',
  changes_requested: 'Send revision request',
  rejected: 'Reject submission',
};
export const RATING_OPTIONS = [5, 4, 3, 2, 1];
