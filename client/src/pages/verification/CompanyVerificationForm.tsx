import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Field, Input } from '../../components/ui';
import { cx } from '../../utils/cx';
import layout from '../../styles/layout.module.css';
import notice from '../../styles/notice.module.css';
import { companyVerificationSchema } from './utils/verification-validations';
import type { CompanyVerificationFormData } from './utils/verification-validations';

interface CompanyVerificationFormProps {
  firstName: string;
  lastName: string;
  onSubmit: (data: CompanyVerificationFormData) => void;
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
  isPending = false,
  isError = false,
  serverError,
  onEdit,
}: CompanyVerificationFormProps) {

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(companyVerificationSchema),
    defaultValues: { website: '', workEmail: '' },
  });

  return (
    <form className={layout.formStack} onSubmit={handleSubmit(onSubmit)} onChange={onEdit} noValidate>
      {/* names come from the account and can't be changed here */}
      <div className={layout.fieldGrid}>
        <Field label="First name" id="first_name">
          <Input id="first_name" value={firstName} readOnly />
        </Field>
        <Field label="Last name" id="last_name">
          <Input id="last_name" value={lastName} readOnly />
        </Field>
      </div>
      <Field
        label="Company website"
        id="website"
        error={errors.website?.message}
      >
        <Input
          {...register('website')}
          id="website"
          type="url"
          inputMode="url"
          placeholder="https://acme.com"
          autoComplete="url"
          aria-invalid={!!errors.website}
        />
      </Field>
      <Field
        label="Work email"
        id="work_email"
        error={errors.workEmail?.message}
        hint="We'll send a 6-digit code here."
      >
        <Input
          {...register('workEmail')}
          id="work_email"
          type="email"
          placeholder="jane@acme.com"
          autoComplete="email"
          aria-invalid={!!errors.workEmail}
        />
      </Field>
      {serverError && <p className={cx(notice.notice, notice.error)} role="alert">{serverError}</p>}
      <Button type="submit" disabled={isPending || isError} busy={isPending}>
        {isPending ? 'Sending code...' : 'Request verification'}
      </Button>
    </form>
  );
}
