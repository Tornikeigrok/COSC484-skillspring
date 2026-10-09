import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApiQuery } from '../lib/queries';
import type { TaskList } from '../lib/types';
import { categories } from '../lib/types';
import {
  Button,
  EmptyState,
  ErrorMessage,
  Field,
  Input,
  Loading,
  PageHeading,
  Select,
} from '../components/ui';
import { TaskCard } from '../components/TaskCard';
export default function TasksPage() {
  const [params, setParams] = useSearchParams();
  const query = useApiQuery<TaskList>(['tasks', params.toString()], `/tasks?${params.toString()}`);
  function filter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = new URLSearchParams();
    for (const [key, value] of data) if (value) next.set(key, String(value));
    setParams(next);
  }
  return (
    <>
      <PageHeading
        eyebrow="DISCOVER YOUR NEXT STEP"
        title="Small tasks. Real impact."
        description="Find a project that fits your skills and build experience you can prove."
      />
      <form key={params.toString()} onSubmit={filter} className="filter-bar">
        <Field label="Search tasks" id="q">
          <Input
            id="q"
            name="q"
            placeholder="Try React, API, or data…"
            defaultValue={params.get('q') || ''}
            maxLength={100}
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
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </Select>
        </Field>
        <Button type="submit">Find tasks</Button>
      </form>
      <ErrorMessage error={query.error} retry={() => query.refetch()} />
      {query.isPending ? (
        <Loading />
      ) : (
        query.data && (
          <>
            <div className="section-caption">
              <span>
                {query.data.total} open {query.data.total === 1 ? 'opportunity' : 'opportunities'}
              </span>
              {params.size > 0 && (
                <Link to="/tasks" className="text-link">
                  Clear filters
                </Link>
              )}
            </div>
            {query.data.items.length ? (
              <div className="task-grid">
                {query.data.items.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <EmptyState title="No tasks found">
                Try a different search or check back when businesses post new opportunities.
              </EmptyState>
            )}
            {query.data.pages > 1 && (
              <nav className="pagination" aria-label="Task pages">
                <Button
                  variant="secondary"
                  disabled={query.data.page <= 1}
                  onClick={() => {
                    const next = new URLSearchParams(params);
                    next.set('page', String(query.data!.page - 1));
                    setParams(next);
                  }}
                >
                  Previous
                </Button>
                <span>
                  Page {query.data.page} of {query.data.pages}
                </span>
                <Button
                  variant="secondary"
                  disabled={query.data.page >= query.data.pages}
                  onClick={() => {
                    const next = new URLSearchParams(params);
                    next.set('page', String(query.data!.page + 1));
                    setParams(next);
                  }}
                >
                  Next
                </Button>
              </nav>
            )}
          </>
        )
      )}
    </>
  );
}
