export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export const DIFFICULTY_LABELS: Record<(typeof DIFFICULTIES)[number], string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};
