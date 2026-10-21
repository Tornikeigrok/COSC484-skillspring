export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export const DIFFICULTY_LABELS: Record<(typeof DIFFICULTIES)[number], string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};


export const TASK_SORTS = {
  recent: 'Most recent',
  shortest: 'Shortest first',
  easiest: 'Easiest first',
} as const;
export type TaskSort = keyof typeof TASK_SORTS;