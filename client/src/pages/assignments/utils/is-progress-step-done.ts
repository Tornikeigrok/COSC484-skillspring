import type { AssignmentDetail } from '../../../lib/types';

export function isProgressStepDone(index: number, detail: AssignmentDetail) {
  return (
    index === 0 ||
    (index === 1 && detail.assignment.status !== 'awaiting_agreement') ||
    (index === 2 &&
      detail.submissions.some((s) =>
        detail.validations.some((v) => v.submission === s.id && v.status === 'passed'),
      )) ||
    (index === 3 && detail.assignment.status === 'completed')
  );
}
