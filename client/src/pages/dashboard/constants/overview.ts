export const FOR_YOU_COUNT = 5;

// tabs above "Recommended for you"
export const OVERVIEW_TABS = {
  forYou: 'For you',
  saved: 'Saved',
} as const;

export type OverviewTab = keyof typeof OVERVIEW_TABS;

// stat tiles under the hero, values are filled in by DashboardPage
export const OVERVIEW_STATS = [
  { key: 'active', label: 'Active projects', hint: 'In progress', to: '/assignments', icon: 'folder' },
  { key: 'proposals', label: 'Proposals sent', hint: 'Awaiting response', to: '/student/proposals', icon: 'send' },
  { key: 'completed', label: 'Completed projects', hint: 'Verified experience', to: '/profile', icon: 'checkCircle' },
] as const;

export type OverviewStatKey = (typeof OVERVIEW_STATS)[number]['key'];

export const OVERVIEW_ICONS = {
  folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4z',
  checkCircle: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8.5 12l2.5 2.5 4.5-5',
} as const;