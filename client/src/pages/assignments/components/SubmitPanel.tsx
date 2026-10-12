import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Assignment } from '../../../lib/types';
import { Button, Card, Field, Input, Textarea } from '../../../components/ui';
import { toFieldErrors, withoutError } from '../../../utils/form-errors';
import type { FieldErrors } from '../../../utils/form-errors';
import { SUBMITTABLE_STATUSES } from '../constants/assignment-statuses';
import layout from '../../../styles/layout.module.css';
import notice from '../../../styles/notice.module.css';
import text from '../../../styles/text.module.css';
import { cx } from '../../../utils/cx';
import { submissionSchema } from '../utils/assignments-validations';

export function SubmitPanel({ assignment }: { assignment: Assignment }) {
  const allowed = SUBMITTABLE_STATUSES.includes(assignment.status);
  const [errors, setErrors] = useState<FieldErrors>({});
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = submissionSchema.safeParse(Object.fromEntries(data));
    if (!result.success) {
      setErrors(toFieldErrors(result.error));
      return;
    }
    setErrors({});
  }
  return (
    <Card>
      <h2>Submit your work</h2>
      <p className={text.muted}>
        Package your solution with a README that explains setup, testing, and your changes.
      </p>
      {allowed ? (
        <form
          className={layout.formStack}
          onSubmit={submit}
          onChange={(e) => setErrors(withoutError(errors, e.target))}
          noValidate
        >
          <Field
            label="Solution ZIP"
            id="solution"
            error={errors.file}
            hint="8 MB maximum. Up to 250 files and 40 MB expanded. Exclude secrets, .git, and node_modules."
          >
            <Input id="solution" name="file" type="file" accept=".zip,application/zip" />
          </Field>
          <Field label="Submission notes" id="notes" error={errors.notes}>
            <Textarea
              id="notes"
              name="notes"
              placeholder="What changed? How did you test it? What should the reviewer know?"
            />
          </Field>
          <p className={cx(notice.notice, notice.info)}>
            We check archive integrity, paths, size limits, and common credential patterns. Your
            code is not executed. The business reviews functionality separately.
          </p>
          <Button type="submit">Upload and check archive →</Button>
        </form>
      ) : (
        <p className={cx(notice.notice, notice.info)}>
          {assignment.status === 'awaiting_agreement'
            ? 'Accept the access agreement before submitting.'
            : assignment.status === 'submitted'
              ? 'Your submission is awaiting review. You can upload another version if changes are requested.'
              : 'This assignment is closed for submissions.'}
        </p>
      )}
    </Card>
  );
}
