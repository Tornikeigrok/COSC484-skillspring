import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../lib/types';
import { Button, Card, Field, Input, PageHeading, Select, Textarea } from '../../components/ui';
import { DIFFICULTIES, DIFFICULTY_LABELS } from '../../constants/tasks';
import { toFieldErrors, withoutError } from '../../utils/form-errors';
import type { FieldErrors } from '../../utils/form-errors';
import layout from '../../styles/layout.module.css';
import links from '../../styles/links.module.css';
import { createTaskSchema } from './utils/business-tasks-validations';

export default function CreateTaskPage() {
  const [agreement, setAgreement] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const result = createTaskSchema.safeParse({ ...values, agreement_required: agreement });
    if (!result.success) {
      setErrors(toFieldErrors(result.error));
      return;
    }
    setErrors({});
  }
  return (
    <div className={layout.narrowPage}>
      <Link to="/business/tasks" className={links.backLink}>
        ← My tasks
      </Link>
      <PageHeading
        eyebrow="A SMALL PROJECT CAN OPEN A BIG DOOR"
        title="Post a task"
        description="Be specific about the problem, deliverable, and definition of done."
      />
      <Card>
        <form
          onSubmit={submit}
          onChange={(e) => setErrors(withoutError(errors, e.target))}
          noValidate
          className={layout.formStack}
        >
          <Field label="Task title" id="title" error={errors.title}>
            <Input id="title" name="title" placeholder="Build a responsive analytics view" />
          </Field>
          <Field
            label="The opportunity"
            id="description"
            error={errors.description}
            hint="Public information only. Add private files after creating the task."
          >
            <Textarea id="description" name="description" />
          </Field>
          <Field
            label="Acceptance criteria"
            id="acceptance_criteria"
            error={errors.acceptance_criteria}
          >
            <Textarea
              id="acceptance_criteria"
              name="acceptance_criteria"
              placeholder="What must the finished work include? How will you review it?"
            />
          </Field>
          <div className={layout.fieldGrid}>
            <Field label="Category" id="category" error={errors.category}>
              <Select id="category" name="category">
                {Object.entries(categories).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Difficulty" id="difficulty" error={errors.difficulty}>
              <Select id="difficulty" name="difficulty">
                {DIFFICULTIES.map((value) => (
                  <option key={value} value={value}>
                    {DIFFICULTY_LABELS[value]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className={layout.fieldGrid}>
            <Field label="Estimated hours" id="estimated_hours" error={errors.estimated_hours}>
              <Input id="estimated_hours" name="estimated_hours" type="number" defaultValue={6} />
            </Field>
            <Field
              label="Skills"
              id="skills"
              error={errors.skills}
              hint="Comma separated, up to 15."
            >
              <Input id="skills" name="skills" placeholder="React, TypeScript" />
            </Field>
          </div>
          <label className={layout.checkboxLabel}>
            <input
              type="checkbox"
              checked={agreement}
              onChange={(e) => setAgreement(e.target.checked)}
            />
            Require an access agreement before files are released
          </label>
          {agreement && (
            <Field
              label="Agreement terms"
              id="agreement_text"
              error={errors.agreement_text}
              hint="The selected student must accept this exact version. Terms lock after selection."
            >
              <Textarea id="agreement_text" name="agreement_text" />
            </Field>
          )}
          <Button type="submit">Publish task →</Button>
        </form>
      </Card>
    </div>
  );
}
