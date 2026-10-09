import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { Link } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { ApiError } from '../lib/api';
export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="SkillSpring home">
      <span className="brand-mark" aria-hidden="true" />
      <span>SkillSpring</span>
    </Link>
  );
}
export function Button({
  children,
  variant = 'primary',
  busy,
  className = '',
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'lime' | 'danger' | 'ghost';
  busy?: boolean;
}) {
  return (
    <button
      {...props}
      className={`button button-${variant} ${className}`}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
    >
      {busy ? 'Please wait…' : children}
    </button>
  );
}
export function Card({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={`card ${className}`}>
      {children}
    </div>
  );
}
export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'error';
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
export function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    awaiting_agreement: 'Agreement required',
    in_progress: 'In progress',
    submitted: 'Awaiting review',
    changes_requested: 'Changes requested',
    validation_failed: 'Archive checks failed',
    completed: 'Completed',
    verified: 'Identity verified',
    unverified: 'Identity unverified',
    pending: 'Pending',
    accepted: 'Selected',
    approved: 'Approved',
    passed: 'Archive checks passed',
  };
  return (
    <Badge
      tone={
        ['completed', 'verified', 'approved', 'passed', 'accepted'].includes(status)
          ? 'success'
          : ['rejected', 'failed', 'validation_failed'].includes(status)
            ? 'error'
            : ['pending', 'submitted', 'awaiting_agreement', 'changes_requested'].includes(status)
              ? 'warning'
              : 'neutral'
      }
    >
      {labels[status] || status.replaceAll('_', ' ')}
    </Badge>
  );
}
export function Field({
  label,
  hint,
  children,
  id,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  id: string;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && (
        <p className="field-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
    </div>
  );
}
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`input ${props.className || ''}`} />;
}
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={5} {...props} className={`input ${props.className || ''}`} />;
}
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`input ${props.className || ''}`} />;
}
export function ErrorMessage({ error, retry }: { error: unknown; retry?: () => void }) {
  if (!error) return null;
  return (
    <div role="alert" className="notice notice-error">
      <p>{error instanceof Error ? error.message : 'Something went wrong. Please try again.'}</p>
      {error instanceof ApiError && error.details.length > 0 && (
        <ul>
          {error.details.map((detail, i) => (
            <li key={i}>
              {detail.path.replaceAll('_', ' ')}: {detail.message}
            </li>
          ))}
        </ul>
      )}
      {retry && (
        <Button variant="secondary" onClick={retry}>
          Try again
        </Button>
      )}
    </div>
  );
}
export function Loading() {
  return (
    <div role="status" className="loading">
      <span className="spinner" />
      Loading…
    </div>
  );
}
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
    <Card className="empty-state">
      <span className="empty-mark" aria-hidden="true">
        ✦
      </span>
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </Card>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function ConfirmDialog({
  trigger,
  title,
  description,
  children,
  open,
  onOpenChange,
}: {
  trigger: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (value: boolean) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description>{description}</Dialog.Description>
          {children}
          <Dialog.Close asChild>
            <Button variant="ghost">Cancel</Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function DateLabel({ value }: { value: string }) {
  return (
    <time dateTime={value}>
      {new Date(value).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}
    </time>
  );
}
