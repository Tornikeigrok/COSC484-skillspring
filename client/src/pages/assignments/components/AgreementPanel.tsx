import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Agreement } from '../../../lib/types';
import { Badge, Button, Card, DateLabel, Field, FieldError, Input } from '../../../components/ui';
import { toFieldErrors, withoutError } from '../../../utils/form-errors';
import type { FieldErrors } from '../../../utils/form-errors';
import layout from '../../../styles/layout.module.css';
import notice from '../../../styles/notice.module.css';
import text from '../../../styles/text.module.css';
import { cx } from '../../../utils/cx';
import { agreementSchema } from '../utils/assignments-validations';
import styles from './AgreementPanel.module.css';

export function AgreementPanel({
  agreement,
  canAccept,
}: {
  agreement: Agreement | null;
  canAccept: boolean;
}) {
  const [errors, setErrors] = useState<FieldErrors>({});
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = agreementSchema.safeParse({
      accepted: data.get('accepted') === 'on',
      accepted_name: data.get('accepted_name'),
    });
    if (!result.success) {
      setErrors(toFieldErrors(result.error));
      return;
    }
    setErrors({});
  }
  if (!agreement)
    return (
      <Card>
        <h2>No agreement required</h2>
        <p className={text.muted}>
          The business did not require an access agreement for this task.
        </p>
      </Card>
    );
  return (
    <Card>
      <div className={layout.headerRow}>
        <h2>Access agreement</h2>
        <Badge>Version {agreement.version}</Badge>
      </div>
      <p className={text.muted}>Read the terms before accessing private starter files.</p>
      <div className={styles.terms}>{agreement.text}</div>
      {agreement.accepted_at ? (
        <div className={cx(notice.notice, notice.success)}>
          Accepted by {agreement.accepted_name} on <DateLabel value={agreement.accepted_at} />.
        </div>
      ) : canAccept ? (
        <form
          className={layout.formStack}
          onSubmit={submit}
          onChange={(e) => setErrors(withoutError(errors, e.target))}
          noValidate
        >
          <Field label="Your full name" id="accepted_name" error={errors.accepted_name}>
            <Input id="accepted_name" name="accepted_name" autoComplete="name" />
          </Field>
          <label className={layout.checkboxLabel}>
            <input name="accepted" type="checkbox" />I have read and accept these access terms.
          </label>
          <FieldError id="accepted-error" message={errors.accepted} />
          <Button type="submit">Accept agreement and unlock files</Button>
        </form>
      ) : (
        <p className={cx(notice.notice, notice.info)}>
          Waiting for the selected student to accept.
        </p>
      )}
    </Card>
  );
}
