import { ICONS } from './posted-tasks';

export const PATHS = {
  ...ICONS,
  code: 'm8 6-6 6 6 6M16 6l6 6-6 6',
  layers: 'M12 2 3 7l9 5 9-5zM3 12l9 5 9-5M3 17l9 5 9-5',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  calendar: 'M4 6h16v15H4zM4 10h16M8 3v4M16 3v4',
  file: 'M14 3H6v18h12V7zM14 3v4h4M9 13h6M9 17h6',
  check: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 12l3 3 5-6',
  link: 'M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1',
};

export const TABS = {
  proposals: { label: 'Proposals', icon: PATHS.people },
  assignment: { label: 'Assignment', icon: PATHS.layers },
  submission: { label: 'Submission', icon: PATHS.file },
  review: { label: 'Review', icon: PATHS.check },
} as const;

export type Tab = keyof typeof TABS;
