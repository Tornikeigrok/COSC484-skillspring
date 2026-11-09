import styles from '../BusinessTasksPage.module.css';

export const FILTERS = {
  all: { label: 'All', statuses: null },
  open: { label: 'Open', statuses: ['open'] },
  assigned: {
    label: 'Assigned',
    statuses: ['assigned', 'awaiting_agreement', 'in_progress', 'changes_requested'],
  },
  review: { label: 'In review', statuses: ['submitted', 'in_review'] },
  closed: { label: 'Completed', statuses: ['completed', 'closed', 'cancelled'] },
} as const;

export type Filter = keyof typeof FILTERS;

export const SORTS = { newest: 'Newest', oldest: 'Oldest' } as const;

export type Sort = keyof typeof SORTS;

export const matches = (filter: Filter, status: string) => {
  const { statuses } = FILTERS[filter];
  return !statuses || (statuses as readonly string[]).includes(status);
};

export const statusTone = (status: string) =>
  matches('open', status)
    ? styles.statusOpen
    : matches('closed', status)
      ? styles.statusDone
      : styles.statusActive;

export const ICONS = {
  download: 'M12 3v12M7 10l5 5 5-5M4 21h16',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5',
  people: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 12 0v1M16 3.5a4 4 0 0 1 0 7M22 21v-1a6 6 0 0 0-4-5.6',
  fileCheck: 'M14 3H6v18h12V7zM14 3v4h4M9 14l2 2 4-4',
  arrow: 'M5 12h14M13 6l6 6-6 6',
};
