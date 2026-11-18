export const ICONS = {
  check: 'M20 6 9 17l-5-5',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  badge: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 12l3 3 5-6',
  pen: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  rocket: 'M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M9 15l-3-3c1-4 5-9 12-9 0 7-5 11-9 12zM15 9h.01',
  shield: 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z',
  building: 'M4 21V5l8-2v18M12 8h8v13M8 9h.01M8 13h.01M8 17h.01M16 12h.01M16 16h.01M2 21h20',
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
};

export const STEPS = [
  { label: 'Proposal accepted', icon: ICONS.badge },
  { label: 'Sign the NDA', icon: ICONS.pen },
  { label: 'Start assignment', icon: ICONS.rocket },
];

// ponytail: summary copy only; swap for the company's real NDA text once the API returns it
export const TERMS = [
  {
    title: 'Confidential information',
    body: 'Anything the company shares with you for this task, including code, data, designs, documents and business plans, is confidential.',
  },
  {
    title: 'How you can use it',
    body: 'Use confidential information only to complete this task. Don’t share it, publish it, or use it for anything else.',
  },
  {
    title: 'Your work',
    body: 'Work you create for this task belongs to the company once it’s delivered. You can describe it in your portfolio without revealing confidential details.',
  },
  {
    title: 'After the task',
    body: 'When the task ends, delete or return any confidential material. Your duty to keep it private continues after the task is done.',
  },
];
