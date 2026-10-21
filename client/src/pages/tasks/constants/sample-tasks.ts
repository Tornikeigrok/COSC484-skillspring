import type { Task, TaskList } from '../../../lib/types';

// Preview data until TasksPage is wired to the API.
const task = (
  id: string,
  company: string,
  fields: Pick<
    Task,
    'title' | 'description' | 'category' | 'difficulty' | 'skills' | 'estimated_hours'
  >,
): Task => ({
  id,
  owner: `owner-${id}`,
  company: {
    id: `company-${id}`,
    name: company,
    description: '',
    website: '',
    verification_status: 'verified',
  },
  acceptance_criteria: '',
  status: 'open',
  agreement_required: false,
  createdAt: '2026-10-01T00:00:00.000Z',
  ...fields,
});

const items: Task[] = [
  task('1', 'Loop Health', {
    title: 'Redesign the onboarding checklist',
    description:
      'Turn our 9-step onboarding into something people actually finish. Figma file and user interviews provided.',
    category: 'ui',
    difficulty: 'medium',
    skills: ['Figma', 'UX research', 'Prototyping'],
    estimated_hours: 8,
  }),
  task('2', 'Parcelly', {
    title: 'Build a rate-limited webhook relay',
    description:
      'Small Node service that receives carrier webhooks, dedupes them, and forwards to our internal API.',
    category: 'api',
    difficulty: 'medium',
    skills: ['Node.js', 'Express', 'Redis'],
    estimated_hours: 16,
  }),
  task('3', 'Brightside Coffee', {
    title: 'Clean and chart 2 years of sales data',
    description:
      'We have messy CSV exports from three stores. Clean them up and show us which drinks sell when.',
    category: 'data',
    difficulty: 'easy',
    skills: ['Python', 'pandas', 'Matplotlib'],
    estimated_hours: 5,
  }),
  task('4', 'Tidewater Labs', {
    title: 'Accessible date-range picker component',
    description:
      'A keyboard-friendly React date-range picker that drops into our design system. Tests required.',
    category: 'component',
    difficulty: 'medium',
    skills: ['React', 'TypeScript', 'a11y'],
    estimated_hours: 8,
  }),
  task('5', 'Greenleaf Market', {
    title: 'Automate our weekly inventory report',
    description:
      'Replace a 2-hour manual spreadsheet ritual with a script that emails the report every Monday.',
    category: 'script',
    difficulty: 'easy',
    skills: ['Python', 'Google Sheets API'],
    estimated_hours: 3,
  }),
  task('6', 'Northstar Studio', {
    title: 'Prototype a voice-note summarizer',
    description: 'Quick proof of concept: upload a voice memo, get a short summary and action items.',
    category: 'poc',
    difficulty: 'medium',
    skills: ['Python', 'Whisper', 'LLMs'],
    estimated_hours: 16,
  }),
];

export const sampleTasks: TaskList = { items, total: items.length, page: 1, pages: 1 };