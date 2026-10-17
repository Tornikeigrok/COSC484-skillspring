import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Badge.module.css';

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'error';
  className?: string;
}) {
  return <span className={cx(styles.badge, styles[tone], className)}>{children}</span>;
}
