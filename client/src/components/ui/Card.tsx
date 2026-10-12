import type { HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import styles from './Card.module.css';

export function Card({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cx(styles.card, className)}>
      {children}
    </div>
  );
}
