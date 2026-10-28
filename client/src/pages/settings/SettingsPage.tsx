import { useState } from 'react';
import { Badge, Button, Card, Field, FieldError, Input, Loading, PageHeading, Textarea } from '../../components/ui';
import { useFetchProfile } from '../dashboard/hooks/use-profile';
import styles from './SettingsPage.module.css';
import { studentProfileSchema, changePasswordSchema } from './utils/settings-validations';
import type { StudentProfileFormData, ChangePasswordFormData } from './utils/settings-validations';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateProfile, useUpdatePassword } from './hooks';
import { parseSkills } from '../../utils/parse-skills';
import { skills } from '../settings/constants/settings';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/ui/radix-modal';
import { Dropdown, DropdownMenu, DropdownRadioGroup, DropdownRadioItem, DropdownTrigger } from '@/ui/radix-dropdown';



export default function SettingsPage() {

  const { data: user } = useFetchProfile();

  const { register, handleSubmit, getValues, setValue, resetField, control, formState: { isDirty } } = useForm({
    resolver: zodResolver(studentProfileSchema),
    values: user && {
      bio: user.Student?.bio ?? '',
      github_url: user.Student?.github_url ?? '',
      skills: '', // only newly picked skills; saved ones render as badges below
    },
  });
  const pickedSkills = useWatch({ control, name: 'skills' });

  /* Update password stuff */
  const [updatePasswordModal, setUpdatePasswordModal] = useState<boolean>(false);
  const { mutate: updatePasswordMutate, isPending: passwordPending, error: passMutateError, reset: resetPasswordMutation } = useUpdatePassword();
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


  /* Update profile stuff */
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const onSubmit = (data: StudentProfileFormData) => {
    const skills = [...new Set([...(user?.Student?.skills ?? []), ...data.skills])];
    updateProfile(
      { bio: data.bio, githubUrl: data.github_url, skills },
      { onSuccess: () => resetField('skills') },
    );
  }

  const addSkill = (skill: string) => {
    if (skill === 'none') return setValue('skills', '', { shouldDirty: true });
    const picked = parseSkills(getValues('skills') ?? '');
    if (picked.includes(skill)) return;
    setValue('skills', [...picked, skill].join(', '), { shouldDirty: true });
  }

  if (!user) return <Loading />;

  const { Student: profile } = user;
  const verified = profile.verification_status === 'verified';
  const initials = `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase();
  return (
    <div className={styles.page}>
      <PageHeading
        eyebrow="Account"
        title="Settings"
        description="Manage how you appear to companies and keep your account secure."
      />

      <section className={styles.section}>
        <header className={styles.sectionIntro}>
          <h2>Profile</h2>
          <p>This is what companies see when you send a proposal.</p>
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

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={styles.body}>
              <Field      
                label="Bio"
                id="bio"
                hint="A few sentences about what you build. Max 2,000 characters."
              >
                <Textarea
                  {...register('bio')}
                  id="bio"
                  name="bio"
                  rows={4}
                  defaultValue={profile.bio ?? ''}
                  placeholder="Frontend developer who loves clean, accessible UI…"
                />
              </Field>
              <Field label="GitHub" id="github_url">
                <Input
                  {...register('github_url')}
                  id="github_url"
                  name="github_url"
                  type="url"
                  defaultValue={profile.github_url ?? ''}
                  placeholder="https://github.com/yourname"
                />
              </Field>
              <Field label="Skills" id="skills" hint="Pick skills from the list, then save.">
                <input type="hidden" {...register('skills')} />
                <Dropdown>
                  <DropdownTrigger id="skills">{pickedSkills || 'Add skills'}</DropdownTrigger>
                <DropdownMenu>
                  {/* value stays '' so nothing shows as checked; we only use the select event */}
                  <DropdownRadioGroup value="" onValueChange={addSkill}>
                    <DropdownRadioItem value='none'>No skills</DropdownRadioItem>
                    {skills.map((v) => (
                      <DropdownRadioItem key={v} value={v}>
                        {v}
                      </DropdownRadioItem>
                    ))}
                  </DropdownRadioGroup>
                </DropdownMenu>
                </Dropdown>
                {profile.skills?.length > 0 && (
                  <div className={styles.skills}>
                    {profile.skills.map((skill: string) => <Badge key={skill}>{skill}</Badge>)}
                  </div>
                )}
              </Field>
            </div>

            <footer className={styles.footer}>
              <p>Changes show on your public profile.</p>
              <Button disabled={!isDirty} type="submit">{isPending ? 'Saving changes...' : 'Save changes'}</Button>
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
