import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Card, Field, PageHeading, StatusBadge, Textarea } from '../../components/ui';
import { toFieldErrors, withoutError } from '../../utils/form-errors';
import type { FieldErrors } from '../../utils/form-errors';
import { sampleProfile } from '../profile/constants/sample-profile';
import { cx } from '../../utils/cx';
import layout from '../../styles/layout.module.css';
import notice from '../../styles/notice.module.css';
import text from '../../styles/text.module.css';
import { verificationSchema } from './utils/verification-validations';
import styles from './VerificationPage.module.css';
export default function VerificationPage() {
  const { user, profile } = sampleProfile;
  const [errors, setErrors] = useState<FieldErrors>({});
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = verificationSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    if (!result.success) {
      setErrors(toFieldErrors(result.error));
      return;
    }
    setErrors({});
  }
  return (
    <div className={layout.narrowPage}>
      <PageHeading
        eyebrow="BUILDING TRUST"
        title={user.role === 'student' ? 'Student verification' : 'Business verification'}
        description="Request an identity review. Project approvals are tracked separately."
      />
      <Card>
        <div className={layout.headerRow}>
          <h2>Verification status</h2>
          <StatusBadge status={profile.verification_status} />
        </div>
        {profile.verification_status === 'verified' ? (
          <p className={cx(notice.notice, notice.success)}>
            Your profile identity has been reviewed and verified.
          </p>
        ) : profile.verification_status === 'pending' ? (
          <p className={cx(notice.notice, notice.info)}>
            Your request is pending a manual review by the project team. It will not be marked
            verified automatically.
          </p>
        ) : (
          <form
            className={layout.formStack}
            onSubmit={submit}
            onChange={(e) => setErrors(withoutError(errors, e.target))}
            noValidate
          >
            <p className={text.muted}>
              Share an institutional or company contact address and a public page that can support
              your identity. Do not upload government IDs, passwords, or financial documents.
            </p>
            <Field
              label="Verification information"
              id="evidence"
              error={errors.evidence}
              hint="20–2,000 characters. Visible only to the project team reviewing requests."
            >
              <Textarea id="evidence" name="evidence" rows={7} />
            </Field>
            <Button type="submit">Request manual review</Button>
          </form>
        )}
        <p className={cx(text.mutedSmall, styles.disclaimer)}>
          Review is handled by the project team. No automated email or identity verification
          provider is connected.
        </p>
      </Card>
    </div>
  );
}
