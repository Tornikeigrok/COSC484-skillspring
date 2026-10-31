export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export const DIFFICULTY_LABELS: Record<(typeof DIFFICULTIES)[number], string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

// matches the task_type enum in db_schema.sql
export const TASK_TYPES = ['ui', 'api', 'data', 'component', 'script', 'poc'] as const;

export type TaskType = (typeof TASK_TYPES)[number];

export const TASK_TYPE_LABELS: Record<TaskType, { label: string; hint: string }> = {
  ui: { label: 'UI', hint: 'Screens and layouts' },
  api: { label: 'API', hint: 'Endpoints and integrations' },
  data: { label: 'Data', hint: 'Analysis and pipelines' },
  component: { label: 'Component', hint: 'Reusable building block' },
  script: { label: 'Script', hint: 'Automation and tooling' },
  poc: { label: 'Proof of concept', hint: 'Quick prototype' },
};

export const TASK_SORTS = {
  recent: 'Most recent',
  shortest: 'Shortest first',
  easiest: 'Easiest first',
} as const;

export type TaskSort = keyof typeof TASK_SORTS;