import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Card, Field, Input, PageHeading, Textarea } from '../../components/ui';
import { toFieldErrors, withoutError } from '../../utils/form-errors';
import type { FieldErrors } from '../../utils/form-errors';
import { sampleProposalTask } from './constants/sample-proposals';
import { cx } from '../../utils/cx';
import layout from '../../styles/layout.module.css';
import links from '../../styles/links.module.css';
import notice from '../../styles/notice.module.css';
import { proposalSchema } from './utils/proposal-validations';
export default function ProposalFormPage() {
  const { id } = useParams();
  const task = sampleProposalTask;
  const [errors, setErrors] = useState<FieldErrors>({});
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = proposalSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!result.success) {
      setErrors(toFieldErrors(result.error));
      return;
    }
    setErrors({});
  }
  return (
    <div className={layout.narrowPage}>
      <Link to={`/tasks/${id}`} className={links.backLink}>
        ← Back to task
      </Link>
      <PageHeading eyebrow="MAKE YOUR CASE" title="A thoughtful start." description={task.title} />
      <Card>
        <form
          className={layout.formStack}
          onSubmit={submit}
          onChange={(e) => setErrors(withoutError(errors, e.target))}
          noValidate
        >
          <Field
            label="Your approach"
            id="message"
            error={errors.message}
            hint="Outline your plan, relevant skills, deliverables, and testing approach. 30–6,000 characters."
          >
            <Textarea
              id="message"
              name="message"
              rows={9}
              placeholder="Here’s how I would approach this task…"
            />
          </Field>
          <Field label="Estimated hours" id="estimated_hours" error={errors.estimated_hours}>
            <Input
              id="estimated_hours"
              name="estimated_hours"
              type="number"
              defaultValue={task.estimated_hours}
            />
          </Field>
          <p className={cx(notice.notice, notice.info)}>
            The business reviews proposals and selects one student. Private starter files become
            available after selection and any required agreement.
          </p>
          <Button type="submit" disabled={task.status !== 'open'}>
            Send proposal →
          </Button>
        </form>
      </Card>
    </div>
  );
}
