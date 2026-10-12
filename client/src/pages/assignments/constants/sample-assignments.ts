import { sampleTask, sampleUser } from '../../../constants/sample';
import type { Assignment, AssignmentDetail } from '../../../lib/types';

export const sampleAssignment: Assignment = {
  id: 'assignment-1',
  task: sampleTask,
  student: sampleUser,
  owner: sampleTask.owner,
  status: 'submitted',
  latest_submission: 'submission-1',
  submission_count: 1,
  createdAt: '2026-01-07T10:00:00.000Z',
};

export const sampleAssignments: Assignment[] = [];

export const sampleAssignmentDetail: AssignmentDetail = {
  assignment: sampleAssignment,
  agreement: {
    id: 'agreement-1',
    text: 'Use the starter files only for this task and keep them private.',
    version: 1,
  },
  files: [{ id: 'file-1', filename: 'starter.zip', size: 20480, sha256: 'sample' }],
  submissions: [
    {
      id: 'submission-1',
      assignment: 'assignment-1',
      file: { id: 'file-2', filename: 'solution.zip', size: 40960, sha256: 'sample' },
      notes: 'Added the chart view and tested it at three widths.',
      version: 1,
      createdAt: '2026-01-08T10:00:00.000Z',
    },
  ],
  reviews: [],
  validations: [
    {
      id: 'validation-1',
      submission: 'submission-1',
      status: 'passed',
      findings: [],
      file_count: 12,
      uncompressed_bytes: 102400,
      execution: 'not_run',
    },
  ],
};
