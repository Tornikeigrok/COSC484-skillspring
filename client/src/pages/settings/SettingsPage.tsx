import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  Button,
  Card,
  ConfirmDialog,
  Field,
  Input,
  PageHeading,
  Textarea,
} from '../../components/ui';
import { toFieldErrors, withoutError } from '../../utils/form-errors';
import type { FieldErrors } from '../../utils/form-errors';
import { sampleProfile } from '../profile/constants/sample-profile';
import { cx } from '../../utils/cx';
import layout from '../../styles/layout.module.css';
import notice from '../../styles/notice.module.css';
import text from '../../styles/text.module.css';
import {
  changePasswordSchema,
  companyProfileSchema,
  deleteAccountSchema,
  studentProfileSchema,
} from './utils/settings-validations';
export default function SettingsPage() {
  const { user, profile } = sampleProfile;
  const [saved, setSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [profileErrors, setProfileErrors] = useState<FieldErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<FieldErrors>({});
  const [deleteErrors, setDeleteErrors] = useState<FieldErrors>({});
  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const schema = user.role === 'student' ? studentProfileSchema : companyProfileSchema;
    const result = schema.safeParse(data);
    if (!result.success) {
      setProfileErrors(toFieldErrors(result.error));
      return;
    }
    setProfileErrors({});
    setSaved(true);
  }
  function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordSaved(false);
    const form = event.currentTarget;
    const result = changePasswordSchema.safeParse(Object.fromEntries(new FormData(form)));
    if (!result.success) {
      setPasswordErrors(toFieldErrors(result.error));
      return;
    }
    setPasswordErrors({});
    setPasswordSaved(true);
    form.reset();
  }
  function deleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = deleteAccountSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    if (!result.success) {
      setDeleteErrors(toFieldErrors(result.error));
      return;
    }
    setDeleteErrors({});
  }
  const student = user.role === 'student';
  return (
    <div className={layout.narrowPage}>
      <PageHeading
        eyebrow="MAKE IT YOURS"
        title="Account settings"
        description="Keep your profile current and your account secure."
      />
      <div className={layout.stack}>
        <Card>
          <h2>Your profile</h2>
          <p className={text.mutedSmall}>
            Signed in as {user.email}. Account role: {student ? 'Student' : 'Business'}.
          </p>
          <form
            className={layout.formStack}
            onSubmit={saveProfile}
            onChange={(e) => setProfileErrors(withoutError(profileErrors, e.target))}
            noValidate
          >
            {saved && (
              <p className={cx(notice.notice, notice.success)} role="status">
                Profile saved.
              </p>
            )}
            <div className={layout.fieldGrid}>
              <Field label="First name" id="first_name" error={profileErrors.first_name}>
                <Input id="first_name" name="first_name" defaultValue={user.first_name} />
              </Field>
              <Field label="Last name" id="last_name" error={profileErrors.last_name}>
                <Input id="last_name" name="last_name" defaultValue={user.last_name} />
              </Field>
            </div>
            {student ? (
              <>
                <Field label="About you" id="bio" error={profileErrors.bio}>
                  <Textarea id="bio" name="bio" defaultValue={profile.bio} />
                </Field>
                <div className={layout.fieldGrid}>
                  <Field label="University" id="university" error={profileErrors.university}>
                    <Input id="university" name="university" defaultValue={profile.university} />
                  </Field>
                  <Field
                    label="Graduation year"
                    id="graduation_year"
                    error={profileErrors.graduation_year}
                  >
                    <Input
                      id="graduation_year"
                      name="graduation_year"
                      type="number"
                      defaultValue={profile.graduation_year}
                    />
                  </Field>
                </div>
                <Field label="GitHub URL" id="github_url" error={profileErrors.github_url}>
                  <Input
                    id="github_url"
                    name="github_url"
                    type="url"
                    defaultValue={profile.github_url}
                    placeholder="https://github.com/yourname"
                  />
                </Field>
                <Field
                  label="Skills"
                  id="skills"
                  error={profileErrors.skills}
                  hint="Comma separated, up to 15."
                >
                  <Input id="skills" name="skills" defaultValue={profile.skills?.join(', ')} />
                </Field>
              </>
            ) : (
              <>
                <Field label="Company name" id="name" error={profileErrors.name}>
                  <Input id="name" name="name" defaultValue={profile.name} />
                </Field>
                <Field
                  label="Company description"
                  id="description"
                  error={profileErrors.description}
                >
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={profile.description}
                  />
                </Field>
                <Field label="Company website" id="website" error={profileErrors.website}>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    defaultValue={profile.website}
                    placeholder="https://example.com"
                  />
                </Field>
              </>
            )}
            <Button type="submit">Save profile</Button>
          </form>
        </Card>
        <Card>
          <h2>Change password</h2>
          <p className={text.mutedSmall}>Changing your password signs out your other sessions.</p>
          <form
            className={layout.formStack}
            onSubmit={changePassword}
            onChange={(e) => setPasswordErrors(withoutError(passwordErrors, e.target))}
            noValidate
          >
            {passwordSaved && (
              <p className={cx(notice.notice, notice.success)} role="status">
                Password updated. Other sessions were signed out.
              </p>
            )}
            <Field
              label="Current password"
              id="current_password"
              error={passwordErrors.current_password}
            >
              <Input
                id="current_password"
                name="current_password"
                type="password"
                autoComplete="current-password"
              />
            </Field>
            <Field label="New password" id="new_password" error={passwordErrors.password}>
              <Input
                id="new_password"
                name="password"
                type="password"
                autoComplete="new-password"
              />
            </Field>
            <Button variant="secondary" type="submit">
              Update password
            </Button>
          </form>
        </Card>
        <Card>
          <h2>Delete account</h2>
          <p className={text.muted}>
            Your login and profile details will be removed. Assignment records, submissions,
            reviews, and approved experience remain for project history. Resolve active assignments
            first.
          </p>
          <ConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            trigger={<Button variant="danger">Delete account</Button>}
            title="Delete your SkillSpring account?"
            description="This revokes all sessions and anonymizes your profile. Project history is retained. This cannot be undone from the app."
          >
            <form
              className={layout.formStack}
              onSubmit={deleteAccount}
              onChange={(e) => setDeleteErrors(withoutError(deleteErrors, e.target))}
              noValidate
            >
              <Field label="Password" id="delete_password" error={deleteErrors.password}>
                <Input
                  id="delete_password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                />
              </Field>
              <Field
                label="Type DELETE to confirm"
                id="confirmation"
                error={deleteErrors.confirmation}
              >
                <Input id="confirmation" name="confirmation" />
              </Field>
              <Button type="submit" variant="danger">
                Permanently delete account
              </Button>
            </form>
          </ConfirmDialog>
        </Card>
      </div>
    </div>
  );
}
