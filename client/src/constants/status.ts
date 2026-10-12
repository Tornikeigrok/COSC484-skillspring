export const STATUS_LABELS: Record<string, string> = {
  awaiting_agreement: 'Agreement required',
  in_progress: 'In progress',
  submitted: 'Awaiting review',
  changes_requested: 'Changes requested',
  validation_failed: 'Archive checks failed',
  completed: 'Completed',
  verified: 'Identity verified',
  unverified: 'Identity unverified',
  pending: 'Pending',
  accepted: 'Selected',
  approved: 'Approved',
  passed: 'Archive checks passed',
};
export const SUCCESS_STATUSES = ['completed', 'verified', 'approved', 'passed', 'accepted'];
export const ERROR_STATUSES = ['rejected', 'failed', 'validation_failed'];
export const WARNING_STATUSES = ['pending', 'submitted', 'awaiting_agreement', 'changes_requested'];
