import { Link } from 'react-router-dom';
import { cx } from '../../utils/cx';
import styles from './Brand.module.css';

export function Brand({ className }: { className?: string }) {
  return (
    <Link className={cx(styles.brand, className)} to="/" aria-label="SkillSpring home">
      <span className={styles.mark} aria-hidden="true" />
      <span>SkillSpring</span>
    </Link>
  );
}
