import type { Company, Proposal, Task, User } from '../lib/types';

export const sampleUser: User = {
  id: 'student-1',
  email: 'isaac@example.test',
  first_name: 'Isaac',
  last_name: 'Tester',
  role: 'student',
};

export const sampleCompany: Company = {
  id: 'company-1',
  user: 'company-user-1',
  name: 'Northstar Labs',
  description: 'We build analytics tools for small teams.',
  website: 'https://example.com',
  verification_status: 'verified',
};

export const sampleTask: Task = {
  id: 'task-1',
  owner: 'company-user-1',
  company: sampleCompany,
  title: 'Build a responsive analytics view',
  description: 'Build a responsive view that charts weekly signups from a provided dataset.',
  acceptance_criteria: 'Works at mobile and desktop widths.\nIncludes a README with test steps.',
  category: 'ui',
  difficulty: 'medium',
  skills: ['React', 'TypeScript'],
  estimated_hours: 6,
  status: 'open',
  agreement_required: false,
  createdAt: '2026-01-05T10:00:00.000Z',
};

export const sampleProposal: Proposal = {
  id: 'proposal-1',
  task: sampleTask,
  student: sampleUser,
  message: 'I would build the chart with a small responsive grid and test it at three widths.',
  estimated_hours: 6,
  status: 'pending',
  createdAt: '2026-01-06T10:00:00.000Z',
};
