import { Link } from 'react-router-dom';
import { cx } from '../../utils/cx';
import styles from './Brand.module.css';

type Role = 'student' | 'company';

export function Brand({ className, role }: { className?: string, role?: Role }) {
  return (
    <Link className={cx(styles.brand, className)} 
      to={`${
        window.location.pathname.length === 1 ? '/' : `${role === 'student' ? '/student' : '/business'}`
      }`} 
      aria-label="SkillSpring home">
      <span className={styles.mark} aria-hidden="true" />
      <span>SkillSpring</span>
    </Link>
  );
}
