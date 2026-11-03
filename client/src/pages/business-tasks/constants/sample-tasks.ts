import type { FileAsset, Proposal, Task } from '../../../lib/types';
import { DIFFICULTIES } from '@/constants/tasks';

export const sampleBusinessTasks: Task[] = [];
export const sampleTaskProposals: Proposal[] = [];
export const sampleStarterFiles: FileAsset[] = [
  { id: 'file-1', filename: 'starter.zip', size: 20480, sha256: 'sample' },
];

export const DIFFICULTY_HINTS: Record<(typeof DIFFICULTIES)[number], string> = {
  easy: 'A focused change a newer student can finish with little guidance.',
  medium: 'Needs some prior experience and a bit of independent problem-solving.',
};
