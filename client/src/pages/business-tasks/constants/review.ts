// Contribution-graph shades, lightest to strongest
export const LEVELS = [
  { value: 1, name: 'Needs work', color: '#9be9a8', hint: 'Broken or missing key requirements.' },
  { value: 2, name: 'Acceptable', color: '#40c463', hint: 'Works, with clear gaps to fix.' },
  { value: 3, name: 'Solid', color: '#30a14e', hint: 'Meets the brief with minor nits.' },
  { value: 4, name: 'Exceptional', color: '#216e39', hint: 'Production ready, beyond the brief.' },
];

// Keys match the review the server returns
export const REVIEW_SCORES = [
  ['functionality', 'Functionality'],
  ['quality', 'Code quality'],
  ['documentation', 'Documentation'],
  ['communication', 'Communication'],
] as const;

export const VERDICT_DISPLAY = {
  accept: { label: 'Approved', activity: 'Work approved', tone: 'success' },
  request_changes: { label: 'Changes requested', activity: 'Changes requested', tone: 'warning' },
  reject: { label: 'Rejected', activity: 'Work rejected', tone: 'error' },
} as const;
