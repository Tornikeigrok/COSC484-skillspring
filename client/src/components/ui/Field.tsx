import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { FieldError } from './FieldError';
import styles from './Field.module.css';

export function Field({
  label,
  hint,
  error,
  children,
  id,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  id: string;
  className?: string;
}) {
  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={id}>{label}</label>
      {children}
      <FieldError id={`${id}-error`} message={error} />
      {hint && (
        <p className={styles.hint} id={`${id}-hint`}>
          {hint}
        </p>
      )}
    </div>
  );
}
