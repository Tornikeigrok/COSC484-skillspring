import { useState } from 'react';
import type { FormEvent } from 'react';
import type { AssignmentDetail, Review } from '../../../lib/types';
import { Button, Card, Field, Select, Textarea } from '../../../components/ui';
import { toFieldErrors, withoutError } from '../../../utils/form-errors';
import type { FieldErrors } from '../../../utils/form-errors';
import { RATING_OPTIONS, REVIEW_DECISION_OPTIONS, REVIEW_SUBMIT_LABELS } from '../constants/review';
import layout from '../../../styles/layout.module.css';
import links from '../../../styles/links.module.css';
import notice from '../../../styles/notice.module.css';
import text from '../../../styles/text.module.css';
import { cx } from '../../../utils/cx';
import { reviewSchema } from '../utils/assignments-validations';

export function ReviewPanel({ detail }: { detail: AssignmentDetail }) {
  const latest = detail.submissions[0];
  const [decision, setDecision] = useState<Review['decision']>('approved');
  const [errors, setErrors] = useState<FieldErrors>({});
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const result = reviewSchema.safeParse({
      decision,
      feedback: fields.get('feedback'),
      rating: fields.get('rating'),
      public_summary: fields.get('public_summary'),
    });
    if (!result.success) {
      setErrors(toFieldErrors(result.error));
      return;
    }
    setErrors({});
  }
  if (!latest || detail.assignment.status !== 'submitted')
    return (
      <Card>
        <h2>Company review</h2>
        <p className={text.muted}>
          A submission that passes archive checks must be awaiting review before you can make a
          decision.
        </p>
      </Card>
    );
  return (
    <Card>
      <h2>Review version {latest.version}</h2>
      <p className={text.muted}>
        Download and inspect the work against your acceptance criteria. Archive checks do not
        establish functional correctness.
      </p>
      <a className={links.fileLink} href="#">
        {latest.file.filename} <span>Download ↓</span>
      </a>
      <p className={text.longText}>{latest.notes}</p>
      <form
        className={layout.formStack}
        onSubmit={submit}
        onChange={(e) => setErrors(withoutError(errors, e.target))}
        noValidate
      >
        <Field label="Review decision" id="decision">
          <Select
            id="decision"
            value={decision}
            onChange={(e) => setDecision(e.target.value as Review['decision'])}
          >
            {REVIEW_DECISION_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Feedback for the student"
          id="feedback"
          error={errors.feedback}
          hint="Private to you and the student. Be specific and actionable."
        >
          <Textarea id="feedback" name="feedback" />
        </Field>
        {decision === 'approved' && (
          <>
            <Field label="Rating" id="rating" error={errors.rating}>
              <Select id="rating" name="rating" defaultValue="5">
                {RATING_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n} / 5
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Public experience summary"
              id="public_summary"
              error={errors.public_summary}
              hint="This appears on the student’s profile. Do not include confidential information."
            >
              <Textarea id="public_summary" name="public_summary" />
            </Field>
            <p className={cx(notice.notice, notice.success)}>
              Approval creates one verified experience record with your rating and this public
              summary.
            </p>
          </>
        )}
        {decision === 'rejected' && (
          <p className={cx(notice.notice, notice.error)}>
            Rejection closes this assignment without verified experience. Use “Request changes” if
            the student should revise their work.
          </p>
        )}
        <Button type="submit" variant={decision === 'rejected' ? 'danger' : 'primary'}>
          {REVIEW_SUBMIT_LABELS[decision]}
        </Button>
      </form>
    </Card>
  );
}
