import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAction, useApiQuery } from '../lib/queries';
import type { Proposal, Task } from '../lib/types';
import {
  Button,
  Card,
  DateLabel,
  EmptyState,
  ErrorMessage,
  Field,
  Input,
  Loading,
  PageHeading,
  StatusBadge,
  Textarea,
} from '../components/ui';
export function ProposalFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const task = useApiQuery<{ task: Task }>(['task', id], `/tasks/${id}`);
  const mutation = useAction(`/tasks/${id}/proposals`);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    mutation.mutate(
      { message: data.get('message'), estimated_hours: Number(data.get('estimated_hours')) },
      { onSuccess: () => navigate('/student/proposals') },
    );
  }
  if (task.isPending) return <Loading />;
  if (task.error) return <ErrorMessage error={task.error} />;
  return (
    <div className="narrow">
      <Link to={`/tasks/${id}`} className="back-link">
        ← Back to task
      </Link>
      <PageHeading
        eyebrow="MAKE YOUR CASE"
        title="A thoughtful start."
        description={task.data!.task.title}
      />
      <Card>
        <form className="form-stack" onSubmit={submit}>
          <ErrorMessage error={mutation.error} />
          <Field
            label="Your approach"
            id="message"
            hint="Outline your plan, relevant skills, deliverables, and testing approach. 30–6,000 characters."
          >
            <Textarea
              id="message"
              name="message"
              minLength={30}
              maxLength={6000}
              rows={9}
              required
              placeholder="Here’s how I would approach this task…"
            />
          </Field>
          <Field label="Estimated hours" id="estimated_hours">
            <Input
              id="estimated_hours"
              name="estimated_hours"
              type="number"
              min={1}
              max={500}
              required
              defaultValue={task.data!.task.estimated_hours}
            />
          </Field>
          <p className="notice">
            The business reviews proposals and selects one student. Private starter files become
            available after selection and any required agreement.
          </p>
          <Button
            type="submit"
            busy={mutation.isPending}
            disabled={task.data!.task.status !== 'open'}
          >
            Send proposal →
          </Button>
        </form>
      </Card>
    </div>
  );
}
export function ProposalsPage() {
  const query = useApiQuery<{ items: Proposal[] }>(['my-proposals'], '/my/proposals');
  return (
    <>
      <PageHeading
        eyebrow="YOUR NEXT OPPORTUNITIES"
        title="My proposals"
        description="Keep track of the projects you’re ready to take on."
      />
      <ErrorMessage error={query.error} retry={() => query.refetch()} />
      {query.isPending ? (
        <Loading />
      ) : query.data?.items.length ? (
        <div className="list-stack">
          {query.data.items.map((item) => (
            <Card key={item.id}>
              <div className="row between">
                <h2>
                  <Link to={`/tasks/${item.task.id}`}>{item.task.title}</Link>
                </h2>
                <StatusBadge status={item.status} />
              </div>
              <p className="muted text-sm">
                {item.task.company.name} · {item.estimated_hours} hours ·{' '}
                <DateLabel value={item.createdAt} />
              </p>
              <p className="preserve-text">{item.message}</p>
              {item.status === 'accepted' && (
                <Link className="text-link" to="/assignments">
                  Open your assignments →
                </Link>
              )}
            </Card>
          ))}
        </div>
      ) : (
        !query.error && (
          <EmptyState
            title="Make your first introduction."
            action={
              <Link className="button button-primary" to="/tasks">
                Explore tasks
              </Link>
            }
          >
            Find a task you’re excited about and explain your approach.
          </EmptyState>
        )
      )}
    </>
  );
}
