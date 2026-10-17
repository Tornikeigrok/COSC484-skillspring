import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { categories } from '../../lib/types';
import { Button, EmptyState, Field, Input, PageHeading, Select } from '../../components/ui';
import { TaskCard } from '../../components/TaskCard';
import { DIFFICULTIES, DIFFICULTY_LABELS } from '../../constants/tasks';
import layout from '../../styles/layout.module.css';
import links from '../../styles/links.module.css';
import { toFieldErrors, withoutError } from '../../utils/form-errors';
import type { FieldErrors } from '../../utils/form-errors';
import { sampleTasks } from './constants/sample-tasks';
import { taskFilterSchema } from './utils/tasks-validations';
import styles from './TasksPage.module.css';
export default function TasksPage() {
  const [params, setParams] = useSearchParams();
  const [errors, setErrors] = useState<FieldErrors>({});
  function filter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = taskFilterSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    if (!result.success) {
      setErrors(toFieldErrors(result.error));
      return;
    }
    setErrors({});
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(result.data)) if (value) next.set(key, value);
    setParams(next);
  }
  return (
    <>
      <PageHeading
        eyebrow="DISCOVER YOUR NEXT STEP"
        title="Small tasks. Real impact."
        description="Find a project that fits your skills and build experience you can prove."
      />
      <form
        key={params.toString()}
        onSubmit={filter}
        onChange={(e) => setErrors(withoutError(errors, e.target))}
        noValidate
        className={styles.filters}
      >
        <Field label="Search tasks" id="q" error={errors.q} className={styles.fullWidth}>
          <Input
            id="q"
            name="q"
            placeholder="Try React, API, or data…"
            defaultValue={params.get('q') || ''}
          />
        </Field>
        <Field label="Category" id="category">
          <Select id="category" name="category" defaultValue={params.get('category') || ''}>
            <option value="">All categories</option>
            {Object.entries(categories).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Difficulty" id="difficulty">
          <Select id="difficulty" name="difficulty" defaultValue={params.get('difficulty') || ''}>
            <option value="">All levels</option>
            {DIFFICULTIES.map((value) => (
              <option key={value} value={value}>
                {DIFFICULTY_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>
        <Button type="submit" className={styles.fullWidth}>
          Find tasks
        </Button>
      </form>
      <>
        <div className={styles.resultsBar}>
          <span>
            {sampleTasks.total} open {sampleTasks.total === 1 ? 'opportunity' : 'opportunities'}
          </span>
          {params.size > 0 && (
            <Link to="/tasks" className={links.textLink}>
              Clear filters
            </Link>
          )}
        </div>
        {sampleTasks.items.length ? (
          <div className={layout.cardGrid}>
            {sampleTasks.items.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <EmptyState title="No tasks found">
            Try a different search or check back when businesses post new opportunities.
          </EmptyState>
        )}
        {sampleTasks.pages > 1 && (
          <nav className={styles.pager} aria-label="Task pages">
            <Button
              variant="secondary"
              disabled={sampleTasks.page <= 1}
              onClick={() => {
                const next = new URLSearchParams(params);
                next.set('page', String(sampleTasks.page - 1));
                setParams(next);
              }}
            >
              Previous
            </Button>
            <span>
              Page {sampleTasks.page} of {sampleTasks.pages}
            </span>
            <Button
              variant="secondary"
              disabled={sampleTasks.page >= sampleTasks.pages}
              onClick={() => {
                const next = new URLSearchParams(params);
                next.set('page', String(sampleTasks.page + 1));
                setParams(next);
              }}
            >
              Next
            </Button>
          </nav>
        )}
      </>
    </>
  );
}
