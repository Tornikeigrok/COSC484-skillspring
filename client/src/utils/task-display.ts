export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

export function formatEstimate(hours: number) {
  if (hours < 8) return `~${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  const days = Math.round(hours / 8);
  return `~${days} ${days === 1 ? 'day' : 'days'}`;
}