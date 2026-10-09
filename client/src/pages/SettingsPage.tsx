import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAction, useApiQuery } from '../lib/queries';
import type { ProfileResponse } from '../lib/types';
import {
  Button,
  Card,
  ConfirmDialog,
  ErrorMessage,
  Field,
  Input,
  Loading,
  PageHeading,
  Textarea,
} from '../components/ui';
export default function SettingsPage() {
  const query = useApiQuery<ProfileResponse>(['profile', 'me'], '/profiles/me');
  const save = useAction('/profiles/me', 'PATCH');
  const password = useAction('/profiles/me/password');
  const [saved, setSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const cache = useQueryClient();
  const navigate = useNavigate();
  const deletion = useMutation({
    mutationFn: (body: unknown) => api('/profiles/me', { method: 'DELETE', body }),
    onSuccess: () => {
      cache.clear();
      cache.setQueryData(['session'], null);
      navigate('/');
    },
  });
  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    const data: Record<string, unknown> = Object.fromEntries(new FormData(event.currentTarget));
    if ('skills' in data)
      data.skills = String(data.skills)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    if (data.graduation_year) data.graduation_year = Number(data.graduation_year);
    else delete data.graduation_year;
    save.mutate(data, { onSuccess: () => setSaved(true) });
  }
  function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordSaved(false);
    const form = event.currentTarget;
    password.mutate(Object.fromEntries(new FormData(form)), {
      onSuccess: () => {
        setPasswordSaved(true);
        form.reset();
      },
    });
  }
  function deleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    deletion.mutate(Object.fromEntries(new FormData(event.currentTarget)));
  }
  if (query.isPending) return <Loading />;
  if (query.error) return <ErrorMessage error={query.error} retry={() => query.refetch()} />;
  const { user, profile } = query.data!;
  const student = user.role === 'student';
  return (
    <div className="narrow">
      <PageHeading
        eyebrow="MAKE IT YOURS"
        title="Account settings"
        description="Keep your profile current and your account secure."
      />
      <div className="list-stack">
        <Card>
          <h2>Your profile</h2>
          <p className="muted text-sm">
            Signed in as {user.email}. Account role: {student ? 'Student' : 'Business'}.
          </p>
          <form className="form-stack" onSubmit={saveProfile}>
            <ErrorMessage error={save.error} />
            {saved && (
              <p className="notice notice-success" role="status">
                Profile saved.
              </p>
            )}
            <div className="form-grid">
              <Field label="First name" id="first_name">
                <Input
                  id="first_name"
                  name="first_name"
                  defaultValue={user.first_name}
                  required
                  maxLength={80}
                />
              </Field>
              <Field label="Last name" id="last_name">
                <Input
                  id="last_name"
                  name="last_name"
                  defaultValue={user.last_name}
                  required
                  maxLength={80}
                />
              </Field>
            </div>
            {student ? (
              <>
                <Field label="About you" id="bio">
                  <Textarea id="bio" name="bio" defaultValue={profile.bio} maxLength={2000} />
                </Field>
                <div className="form-grid">
                  <Field label="University" id="university">
                    <Input
                      id="university"
                      name="university"
                      defaultValue={profile.university}
                      maxLength={160}
                    />
                  </Field>
                  <Field label="Graduation year" id="graduation_year">
                    <Input
                      id="graduation_year"
                      name="graduation_year"
                      type="number"
                      min={2000}
                      max={2100}
                      defaultValue={profile.graduation_year}
                    />
                  </Field>
                </div>
                <Field label="GitHub URL" id="github_url">
                  <Input
                    id="github_url"
                    name="github_url"
                    type="url"
                    defaultValue={profile.github_url}
                    placeholder="https://github.com/yourname"
                    maxLength={300}
                  />
                </Field>
                <Field label="Skills" id="skills" hint="Comma separated, up to 15.">
                  <Input
                    id="skills"
                    name="skills"
                    defaultValue={profile.skills?.join(', ')}
                    maxLength={600}
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label="Company name" id="name">
                  <Input
                    id="name"
                    name="name"
                    defaultValue={profile.name}
                    required
                    maxLength={160}
                  />
                </Field>
                <Field label="Company description" id="description">
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={profile.description}
                    maxLength={2000}
                  />
                </Field>
                <Field label="Company website" id="website">
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    defaultValue={profile.website}
                    placeholder="https://example.com"
                    maxLength={300}
                  />
                </Field>
              </>
            )}
            <Button type="submit" busy={save.isPending}>
              Save profile
            </Button>
          </form>
        </Card>
        <Card>
          <h2>Change password</h2>
          <p className="muted text-sm">Changing your password signs out your other sessions.</p>
          <form className="form-stack" onSubmit={changePassword}>
            <ErrorMessage error={password.error} />
            {passwordSaved && (
              <p className="notice notice-success" role="status">
                Password updated. Other sessions were signed out.
              </p>
            )}
            <Field label="Current password" id="current_password">
              <Input
                id="current_password"
                name="current_password"
                type="password"
                autoComplete="current-password"
                required
              />
            </Field>
            <Field label="New password" id="new_password">
              <Input
                id="new_password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={10}
                maxLength={72}
                required
              />
            </Field>
            <Button variant="secondary" type="submit" busy={password.isPending}>
              Update password
            </Button>
          </form>
        </Card>
        <Card>
          <h2>Delete account</h2>
          <p className="muted">
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
            <form className="form-stack" onSubmit={deleteAccount}>
              <ErrorMessage error={deletion.error} />
              <Field label="Password" id="delete_password">
                <Input
                  id="delete_password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </Field>
              <Field label="Type DELETE to confirm" id="confirmation">
                <Input id="confirmation" name="confirmation" pattern="DELETE" required />
              </Field>
              <Button type="submit" variant="danger" busy={deletion.isPending}>
                Permanently delete account
              </Button>
            </form>
          </ConfirmDialog>
        </Card>
      </div>
    </div>
  );
}
