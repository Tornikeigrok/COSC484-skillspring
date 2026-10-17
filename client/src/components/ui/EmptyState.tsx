import type { ReactNode } from 'react';
import { Card } from './Card';
import styles from './EmptyState.module.css';

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Card className={styles.emptyState}>
      <span className={styles.icon} aria-hidden="true">
        ✦
      </span>
      <h2>{title}</h2>
      <p className={styles.description}>{children}</p>
      {action}
    </Card>
  );
}
