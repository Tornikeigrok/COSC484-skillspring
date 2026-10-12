import type { SelectHTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import inputStyles from './Input.module.css';

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cx(inputStyles.input, className)} />;
}
