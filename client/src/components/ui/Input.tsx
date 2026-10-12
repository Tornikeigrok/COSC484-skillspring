import type { InputHTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import styles from './Input.module.css';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(styles.input, className)} />;
}
