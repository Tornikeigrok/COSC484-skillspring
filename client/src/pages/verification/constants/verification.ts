export const GRAD_YEARS = ['2026', '2027', '2028', '2029', '2030'];
export const BIO_MAX = 1000; // matches verificationSchema

// shared props for inline stroke svgs
export const ICON = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

export const ICONS = {
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  university: 'M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18',
  building: 'M4 21V5l8-2v18M12 8h8v13M8 9h.01M8 13h.01M8 17h.01M16 12h.01M16 16h.01M2 21h20',
  calendar: 'M4 5h16v16H4zM4 10h16M8 3v4M16 3v4',
  mail: 'M3 5h18v14H3zM3 7l9 6 9-6',
  file: 'M14 3H6v18h12V7zM14 3v4h4M9 13h6M9 17h4',
  globe:
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18',
  cap: 'M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5',
  mailCode: 'M21 12V5H3v14h9M3 7l9 6 9-6M15 19l2 2 4-4',
  badge: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 12l3 3 5-6',
  check: 'M20 6 9 17l-5-5',
  arrow: 'M5 12h14M13 6l6 6-6 6',
} as const;

// the verification flow, shown as a stepper on the left panel
export const STEPS = [
  { label: 'Your information', icon: ICONS.cap },
  { label: 'Receive code', icon: ICONS.mailCode },
  { label: 'Get verified', icon: ICONS.badge },
] as const;

export const COPY = {
  student: {
    eyebrow: 'Student verification',
    title: 'Verify your student status',
    description:
      'Confirm you’re a current college student to access tasks, build experience, and work with verified companies.',
  },
  company: {
    eyebrow: 'Company verification',
    title: 'Verify your company',
    description:
      'Confirm you work at the company before posting tasks, so students know every brief is real.',
  },
} as const;
