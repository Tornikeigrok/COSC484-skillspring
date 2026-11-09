import { ICON } from '../constants/verification';

export function Icon({
  d,
  size = 18,
  className,
}: {
  d: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg {...ICON} width={size} height={size} className={className}>
      <path d={d} />
    </svg>
  );
}
