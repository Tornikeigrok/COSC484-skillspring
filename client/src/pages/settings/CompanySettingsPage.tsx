import { useState } from 'react';
import { Badge, Button, Card, Field, FieldError, Input, Loading, PageHeading, Textarea } from '../../components/ui';
import { useFetchCompanyProfile } from '../dashboard/hooks/use-profile';
import styles from './SettingsPage.module.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { companyProfileSchema, changePasswordSchema } from './utils/settings-validations';
import type { CompanyProfileFormData, ChangePasswordFormData } from './utils/settings-validations';
import { useUpdateCompanyPassword, useUpdateCompanyProfile } from './hooks';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/ui/radix-modal';

export default function CompanySettingsPage() {
  const { data: user } = useFetchCompanyProfile();

  // hooks must run before the early return below, on every render
  const { register, handleSubmit, formState: { errors, isDirty }} = useForm({
    resolver: zodResolver(companyProfileSchema),
    values: user && {
      first_name: user.first_name,
      last_name: user.last_name,
      description: user.Company.description ?? '',
    },
  });

  const { mutate: profile } = useUpdateCompanyProfile();
  const handleProfileSave = (data: CompanyProfileFormData) => {
    profile({
        first_name: data.first_name,
        last_name: data.last_name,
        description: data.description
    });
  }

  /* Update password stuff */
  const [updatePasswordModal, setUpdatePasswordModal] = useState<boolean>(false);
  const { mutate: updatePasswordMutate, isPending: passwordPending, error: passMutateError, reset: resetPasswordMutation } = useUpdateCompanyPassword();
  const { register: updatePassword, handleSubmit: handleUpdatePassword, reset: resetPasswordForm, formState: { errors: passwordUpdateError }} = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  // closing the dialog (cancel, esc, success) wipes typed passwords and any server error
  const onPasswordDialogChange = (open: boolean) => {
    setUpdatePasswordModal(open);
    if (!open) {
      resetPasswordForm();
      resetPasswordMutation();
    }
  }

  const onPasswordUpdate = (data: ChangePasswordFormData) => {
    updatePasswordMutate({ currentPassword: data.current_password, newPassword: data.password },
      { onSuccess: () => onPasswordDialogChange(false) });
  }

  if (!user) return <Loading />;

  const { Company: company } = user;
  const verified = company.verification_status === 'verified';
  const initials = `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase();

  return (
    <div className={styles.page}>
      <PageHeading
        eyebrow="Account"
        title="Settings"
        description="Manage how your company appears to students and keep your account secure."
      />

      <section className={styles.section}>
        <header className={styles.sectionIntro}>
          <h2>Company profile</h2>
          <p>This is what students see on your tasks.</p>
        </header>

        <Card className={styles.panel}>
          <div className={styles.identity}>
            <span className={styles.avatar} aria-hidden="true">
              {initials}
            </span>
            <div className={styles.identityText}>
              <p className={styles.name}>
                {user.first_name} {user.last_name}
              </p>
              <p className={styles.email}>{user.email}</p>
            </div>
            <Badge tone={verified ? 'success' : 'neutral'}>{verified ? 'Verified' : 'Unverified'}</Badge>
          </div>

          <form onSubmit={handleSubmit(handleProfileSave)} noValidate>
            <div className={styles.body}>
              <div className={styles.row}>
                <Field label="First name" id="first_name" error={errors.first_name?.message}>
                  <Input {...register('first_name')} id="first_name" autoComplete="given-name" />
                </Field>
                <Field label="Last name" id="last_name" error={errors.last_name?.message}>
                  <Input {...register('last_name')} id="last_name" autoComplete="family-name" />
                </Field>
              </div>
              <Field label="Company name" id="company_name">
                <Input id="company_name" defaultValue={company.name} readOnly />
              </Field>
              <Field label="Website" id="website" hint="Set during verification.">
                <Input id="website" type="url" defaultValue={company.website ?? ''} placeholder="Not set yet" readOnly />
              </Field>
              <Field
                label="Description"
                id="description"
                hint="What your company does and what students can expect. Max 2,000 characters."
                error={errors.description?.message}
              >
                <Textarea
                  {...register('description')}
                  id="description"
                  rows={5}
                  placeholder="We build tools that help small teams ship faster…"
                />
              </Field>
            </div>

            <footer className={styles.footer}>
              <p>Changes show on your public company profile.</p>
              <Button disabled={!isDirty} type="submit">Save changes</Button>
            </footer>
          </form>
        </Card>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionIntro}>
          <h2>Security</h2>
          <p>Use a strong password you don't use anywhere else.</p>
        </header>

        <Card className={styles.panel}>
          <div className={styles.summary}>
            <span className={styles.summaryIcon} aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </span>
            <span className={styles.summaryText}>
              <span className={styles.summaryTitle}>Password</span>
              <span className={styles.summaryMeta}>••••••••••</span>
            </span>
            <Dialog open={updatePasswordModal} onOpenChange={onPasswordDialogChange}>
              <DialogTrigger className={styles.summaryAction}>Change</DialogTrigger>
              <DialogContent>
                <DialogTitle>Change password</DialogTitle>
                <DialogDescription>
                  Enter your current password, then choose a new one.
                </DialogDescription>

                <form onSubmit={handleUpdatePassword(onPasswordUpdate)} noValidate>
                  <div className={styles.dialogBody}>
                    <Field label="Current password" id="current_password" error={passwordUpdateError.current_password?.message}>
                      <Input
                        {...updatePassword('current_password', { onChange: () => resetPasswordMutation() })}
                        id="current_password"
                        name="current_password"
                        type="password"
                        autoComplete="current-password"
                      />
                    </Field>
                    <Field label="New password" id="password" error={passwordUpdateError.password?.message}>
                      <Input
                        {...updatePassword('password', { onChange: () => resetPasswordMutation() })}
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                      />
                    </Field>
                    {/* server errors aren't always about the current password, so show them for the whole form */}
                    <FieldError id="password-form-error" message={passMutateError?.message} />
                  </div>
                  <footer className={styles.dialogFooter}>
                    <DialogClose asChild>
                      <Button type="button" variant="ghost">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button disabled={passwordPending} type="submit">{passwordPending ? 'Updating...' : 'Update password'}</Button>
                  </footer>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      </section>
    </div>
  );
}
