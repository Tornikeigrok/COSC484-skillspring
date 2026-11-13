import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Field, Input, buttonClass } from '../../components/ui';
import { cx } from '../../utils/cx';
import layout from '../../styles/layout.module.css';
import notice from '../../styles/notice.module.css';
import { companyVerificationSchema } from './utils/verification-validations';
import type { CompanyVerificationFormData } from './utils/verification-validations';
import { Icon } from './components/Icon';
import { ICONS } from './constants/verification';
import styles from './Verification.module.css';

interface CompanyVerificationFormProps {
  firstName: string;
  lastName: string;
  onSubmit: (data: CompanyVerificationFormData) => void;
  onCancel: () => void;
  isPending?: boolean;
  isError?: boolean;
  serverError?: string;
  // lets the parent clear a stale server error once the user edits the form
  onEdit?: () => void;
}

export function CompanyVerificationForm({
  firstName,
  lastName,
  onSubmit,
  onCancel,
  isPending = false,
  isError = false,
  serverError,
  onEdit,
}: CompanyVerificationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(companyVerificationSchema),
    defaultValues: { website: '', workEmail: '' },
  });

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} onChange={onEdit} noValidate>
      {/* names come from the account and can't be changed here */}
      <div className={layout.fieldGrid}>
        <Field label="First name" id="first_name">
          <Input id="first_name" value={firstName} readOnly />
        </Field>
        <Field label="Last name" id="last_name">
          <Input id="last_name" value={lastName} readOnly />
        </Field>
      </div>
      <Field label="Company website" id="website" error={errors.website?.message}>
        <div className={styles.withIcon}>
          <Icon d={ICONS.globe} className={styles.fieldIcon} />
          <Input
            {...register('website')}
            id="website"
            type="url"
            inputMode="url"
            placeholder="https://acme.com"
            autoComplete="url"
            aria-invalid={!!errors.website}
          />
        </div>
      </Field>
      <Field
        label="Work email"
        id="work_email"
        error={errors.workEmail?.message}
        hint="We'll send a 6-digit code here."
      >
        <div className={styles.withIcon}>
          <Icon d={ICONS.mail} className={styles.fieldIcon} />
          <Input
            {...register('workEmail')}
            id="work_email"
            type="email"
            placeholder="jane@acme.com"
            autoComplete="email"
            aria-invalid={!!errors.workEmail}
          />
        </div>
      </Field>
      {serverError && (
        <p className={cx(notice.notice, notice.error)} role="alert">
          {serverError}
        </p>
      )}
      <div className={styles.actions}>
        <button
          type="button"
          className={buttonClass('secondary', styles.cancel)}
          onClick={onCancel}
        >
          Cancel
        </button>
        <Button type="submit" disabled={isError} busy={isPending}>
          Continue
          <Icon d={ICONS.arrow} size={16} />
        </Button>
      </div>
    </form>
  );
}
