import { ICON } from '../constants/discover';

export function Svg({ d, size = 16, className }: { d: string; size?: number; className?: string }) {
  return (
    <svg {...ICON} width={size} height={size} className={className}>
      <path d={d} />
    </svg>
  );
}
