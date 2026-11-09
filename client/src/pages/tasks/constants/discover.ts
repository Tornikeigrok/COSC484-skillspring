import type { CSSProperties } from 'react';
import type { StudentProfile } from '@/pages/dashboard/hooks/use-profile';

const DAY = 86_400_000;

// quick views over the task list, shown as tabs above it
export const TASK_TABS = {
  all: { label: 'All tasks', match: () => true },
  new: {
    label: 'New this week',
    match: (t: { created_at: string }) => Date.now() - Date.parse(t.created_at) < 7 * DAY,
  },
  quick: {
    label: 'Under a day',
    match: (t: { estimated_hours: number | null }) =>
      t.estimated_hours !== null && t.estimated_hours <= 8,
  },
} as const;

export type TaskTab = keyof typeof TASK_TABS;

// URL search params the page reads and writes
export const PARAM = {
  q: 'q',
  tab: 'tab',
  sort: 'sort',
  type: 'type',
  difficulty: 'difficulty',
} as const;

export const RECOMMENDED_COUNT = 3;
export const ASIDE_ID = 'discover-aside';
export const COMPANY_AVATARS = 5;

// shared props for inline stroke svgs
export const ICON = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

export const ICONS = {
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.5-3.5',
  calendar: 'M4 5h16v16H4zM4 10h16M8 3v4M16 3v4',
  bars: 'M6 20v-4M12 20v-9M18 20V5',
  bookmark: 'M6 3h12v18l-6-4-6 4z',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  chevron: 'm9 6 6 6-6 6',
  chevronDown: 'm6 9 6 6 6-6',
  check: 'M20 6 9 17l-5-5',
  sparkle: 'M12 3l2 7 7 2-7 2-2 7-2-7-7-2 7-2z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  shield:'M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6zM8.5 12l2.5 2.5 4.5-5',
} as const;

// onboarding checklist in the "Your progress" card
export const PROGRESS_STEPS: {
  label: string;
  to: string;
  done: (s: StudentProfile['Student']) => boolean;
}[] = [
  { label: 'Create your profile', to: '/profile', done: () => true },
  { label: 'Add your skills', to: '/settings', done: (s) => s.skills.length > 0 },
  { label: 'Write a short bio', to: '/settings', done: (s) => !!s.bio },
  { label: 'Link your GitHub', to: '/settings', done: (s) => !!s.github_url },
  {
    label: 'Verify your student account',
    to: '/verification',
    done: (s) => s.verification_status === 'verified',
  },
];

// company initials tinted by task type, same tokens TaskCard uses
export const tint = (type: string) =>
  ({
    '--tint-bg': `var(--category-${type}-bg, var(--color-brand-soft))`,
    '--tint-fg': `var(--category-${type}-fg, var(--color-brand))`,
  }) as CSSProperties;
