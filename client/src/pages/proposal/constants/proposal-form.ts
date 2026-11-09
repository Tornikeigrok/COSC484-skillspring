export const APPROACH_MAX = 4000;
export const QUESTIONS_MAX = 1000;

export const HOUR_OPTIONS = [1, 2, 4, 6, 8, 12, 16, 24, 40] as const;
export type HourPick = (typeof HOUR_OPTIONS)[number];

export const REFERENCES = ['Design spec', 'API documentation'];

// shared props for inline stroke svgs
export const ICON = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

export const ICONS = {
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  calendar: 'M4 5h16v16H4zM4 10h16M8 3v4M16 3v4',
  bars: 'M6 20v-4M12 20v-9M18 20V5',
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
  external: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4z',
  check: 'M20 6 9 17l-5-5',
  x: 'M18 6 6 18M6 6l12 12',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.3-4.3',
};
