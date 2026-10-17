import type { ButtonHTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'lime' | 'dark' | 'ghost' | 'danger';

export function buttonClass(variant: ButtonVariant = 'primary', className?: string) {
  return cx(styles.button, styles[variant], className);
}

export function Button({
  children,
  variant = 'primary',
  busy,
  className,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  busy?: boolean;
}) {
  return (
    <button
      {...props}
      className={buttonClass(variant, className)}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
    >
      {busy ? 'Please wait…' : children}
    </button>
  );
}
