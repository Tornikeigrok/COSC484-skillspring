import type { TextareaHTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import inputStyles from './Input.module.css';
import styles from './Textarea.module.css';

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea rows={5} {...props} className={cx(inputStyles.input, styles.textarea, className)} />
  );
}
