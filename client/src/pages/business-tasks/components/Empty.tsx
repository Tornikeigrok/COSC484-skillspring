import type { ReactNode } from 'react';
import { Icon } from './Icon';
import styles from './Empty.module.css';

export function Empty({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon}>
        <Icon d={icon} />
      </span>
      <h3>{title}</h3>
      {children}
    </div>
  );
}
