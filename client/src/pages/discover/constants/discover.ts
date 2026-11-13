import type { CSSProperties } from 'react';
import type { StudentProfile } from '@/pages/home/hooks/use-profile';

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
  tech: 'tech',
} as const;

// checkbox filter groups in the left sidebar, each stored as a comma list in the URL
export const FILTER_KEYS = ['type', 'difficulty', 'tech'] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];

// tech filter options; the server will match these against task tech stacks
export const TECHNOLOGIES = [
  'React',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Express',
  'Next.js',
  'Python',
  'Java',
  'SQL',
  'PostgreSQL',
  'MongoDB',
  'Docker',
  'AWS',
  'GraphQL',
  'Tailwind CSS',
] as const;

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
  shield: 'M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6zM8.5 12l2.5 2.5 4.5-5',
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

// well-known companies -> Simple Icons slug (https://simpleicons.org); everyone else keeps initials
export const KNOWN_LOGOS: Record<string, string> = {
  google: 'google',
  figma: 'figma',
  notion: 'notion',
  shopify: 'shopify',
  stripe: 'stripe',
  linear: 'linear',
  github: 'github',
  gitlab: 'gitlab',
  vercel: 'vercel',
  netflix: 'netflix',
  spotify: 'spotify',
  airbnb: 'airbnb',
  uber: 'uber',
  meta: 'meta',
  apple: 'apple',
  nvidia: 'nvidia',
  intel: 'intel',
  atlassian: 'atlassian',
  discord: 'discord',
  dropbox: 'dropbox',
  reddit: 'reddit',
  pinterest: 'pinterest',
  paypal: 'paypal',
  coinbase: 'coinbase',
  cloudflare: 'cloudflare',
  mongodb: 'mongodb',
  supabase: 'supabase',
  docker: 'docker',
  anthropic: 'anthropic',
  tesla: 'tesla',
  samsung: 'samsung',
  duolingo: 'duolingo',
};

// full-colour logos Simple Icons only has in one colour
const GOOGLE_G =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">' +
  '<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>' +
  '<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>' +
  '<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>' +
  '<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>' +
  '</svg>';

const LOGO_OVERRIDES: Record<string, string> = {
  google: `data:image/svg+xml,${encodeURIComponent(GOOGLE_G)}`,
};

// logo image URL for well-known companies, undefined for everyone else
export const logoSrc = (company: string) => {
  const words = company
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ''));
  const slug = KNOWN_LOGOS[words.join('')] ?? KNOWN_LOGOS[words[0]];
  if (!slug) return undefined;
  return LOGO_OVERRIDES[slug] ?? `https://cdn.simpleicons.org/${slug}`;
};
