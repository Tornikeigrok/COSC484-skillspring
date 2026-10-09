import type { FormEvent } from 'react';
import { useAction, useApiQuery } from '../lib/queries';
import type { ProfileResponse } from '../lib/types';
import {
  Button,
  Card,
  ErrorMessage,
  Field,
  Loading,
  PageHeading,
  StatusBadge,
  Textarea,
} from '../components/ui';
export default function VerificationPage() {
  const query = useApiQuery<ProfileResponse>(['profile', 'me'], '/profiles/me');
  const mutation = useAction('/profiles/me/verification');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate(Object.fromEntries(new FormData(event.currentTarget)));
  }
  if (query.isPending) return <Loading />;
  if (query.error) return <ErrorMessage error={query.error} retry={() => query.refetch()} />;
  const { user, profile } = query.data!;
  return (
    <div className="narrow">
      <PageHeading
        eyebrow="BUILDING TRUST"
        title={user.role === 'student' ? 'Student verification' : 'Business verification'}
        description="Request an identity review. Project approvals are tracked separately."
      />
      <Card>
        <div className="row between">
          <h2>Verification status</h2>
          <StatusBadge status={profile.verification_status} />
        </div>
        {profile.verification_status === 'verified' ? (
          <p className="notice notice-success">
            Your profile identity has been reviewed and verified.
          </p>
        ) : profile.verification_status === 'pending' ? (
          <p className="notice">
            Your request is pending a manual review by the project team. It will not be marked
            verified automatically.
          </p>
        ) : (
          <form className="form-stack" onSubmit={submit}>
            <ErrorMessage error={mutation.error} />
            <p className="muted">
              Share an institutional or company contact address and a public page that can support
              your identity. Do not upload government IDs, passwords, or financial documents.
            </p>
            <Field
              label="Verification information"
              id="evidence"
              hint="20–2,000 characters. Visible only to the project team reviewing requests."
            >
              <Textarea
                id="evidence"
                name="evidence"
                minLength={20}
                maxLength={2000}
                rows={7}
                required
              />
            </Field>
            <Button type="submit" busy={mutation.isPending}>
              Request manual review
            </Button>
          </form>
        )}
        <p className="text-sm muted mt-4">
          Review is handled by the project team. No automated email or identity verification
          provider is connected.
        </p>
      </Card>
    </div>
  );
}
