import type { TaskType } from '@/constants/tasks';

export const TITLE_MAX = 160;

export const TYPE_ICONS: Record<TaskType, string> = {
  ui: 'M3 4h18v16H3zM3 9h18M9 9v11',
  api: 'm8 6-6 6 6 6M16 6l6 6-6 6',
  data: 'M12 3c5 0 8 1.3 8 3s-3 3-8 3-8-1.3-8-3 3-3 8-3zM4 6v12c0 1.7 3 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3 3 8 3s8-1.3 8-3',
  component: 'M12 2 3 7l9 5 9-5zM3 12l9 5 9-5M3 17l9 5 9-5',
  script: 'M4 17l6-5-6-5M12 19h8',
  poc: 'M13 2 4 14h7l-1 8 9-12h-7z',
};

export const FORM_ICONS = {
  bold: 'M7 4h6a4 4 0 0 1 0 8H7zM7 12h7a4 4 0 0 1 0 8H7z',
  italic: 'M19 4h-9M14 20H5M15 4 9 20',
  code: 'm8 6-6 6 6 6M16 6l6 6-6 6',
  link: 'M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1',
  bullets: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
  numbers: 'M10 6h10M10 12h10M10 18h10M4 4v4M3 8h2M3 14h2l-2 4h2',
  undo: 'M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3',
  redo: 'm15 14 5-5-5-5M20 9H10a6 6 0 0 0 0 12h3',
  upload: 'M7 18a5 5 0 0 1-.9-9.9A6 6 0 0 1 17.7 8 4.5 4.5 0 0 1 17 18M12 12v9M8.5 15.5 12 12l3.5 3.5',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v5M12 8h.01',
  trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6',
};

export type Tool =
  | { label: string; icon: string; wrap: [before: string, after: string, placeholder: string] }
  | { label: string; icon: string; prefix: (index: number) => string };

// null renders a divider between groups
export const TOOLBAR: Array<Tool | null> = [
  { label: 'Bold', icon: FORM_ICONS.bold, wrap: ['**', '**', 'bold text'] },
  { label: 'Italic', icon: FORM_ICONS.italic, wrap: ['_', '_', 'italic text'] },
  { label: 'Code', icon: FORM_ICONS.code, wrap: ['`', '`', 'code'] },
  { label: 'Link', icon: FORM_ICONS.link, wrap: ['[', '](https://)', 'link text'] },
  null,
  { label: 'Bulleted list', icon: FORM_ICONS.bullets, prefix: () => '- ' },
  { label: 'Numbered list', icon: FORM_ICONS.numbers, prefix: (i) => `${i + 1}. ` },
];
