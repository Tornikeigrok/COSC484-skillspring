export const parseSkills = (value: string) =>
  value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
