import { cx } from '../../../utils/cx';
import styles from '../BusinessTasksPage.module.css';

// stroke icon drawn from a single 24x24 path; paths live in this folder's constants
export function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg className={cx(styles.svg, className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
