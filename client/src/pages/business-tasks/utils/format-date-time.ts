// "2026-11-03T14:05:00Z" -> "Nov 3, 2026, 2:05 PM" (in the viewer's locale)
export const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
