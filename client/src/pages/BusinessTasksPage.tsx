import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAction, useApiQuery } from '../lib/queries';
import type { Assignment, FileAsset, Proposal, Task } from '../lib/types';
import { categories, fullName } from '../lib/types';
import { fileUrl } from '../lib/api';
import { TaskCard } from '../components/TaskCard';
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorMessage,
  Field,
  Input,
  Loading,
  PageHeading,
  Select,
  StatusBadge,
  Textarea,
} from '../components/ui';
export function BusinessTasksPage() {
  const query = useApiQuery<{ items: Task[] }>(['my-tasks'], '/my/tasks');
  return (
    <>
      <PageHeading
        eyebrow="MAKE SPACE FOR TALENT"
        title="My tasks"
        description="Focused projects. Fresh perspectives. Meaningful outcomes."
        action={
          <Link className="button button-primary" to="/business/tasks/new">
            + Post a task
          </Link>
        }
      />
      <ErrorMessage error={query.error} retry={() => query.refetch()} />
      {query.isPending ? (
        <Loading />
      ) : query.data?.items.length ? (
        <div className="task-grid">
          {query.data.items.map((task) => (
            <TaskCard key={task.id} task={task} manage />
          ))}
        </div>
      ) : (
        !query.error && (
          <EmptyState
            title="What could a fresh perspective solve?"
            action={
              <Link className="button button-primary" to="/business/tasks/new">
                Post your first task
              </Link>
            }
          >
            Start with a small, well-defined piece of work.
          </EmptyState>
        )
      )}
    </>
  );
}
export function CreateTaskPage() {
  const mutation = useAction<{ task: Task }>('/tasks');
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    mutation.mutate(
      {
        ...values,
        estimated_hours: Number(values.estimated_hours),
        skills: String(values.skills)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        agreement_required: agreement,
        agreement_text: values.agreement_text || '',
      },
      { onSuccess: (result) => navigate(`/business/tasks/${result.task.id}/proposals`) },
    );
  }
  return (
    <div className="narrow">
      <Link to="/business/tasks" className="back-link">
        ← My tasks
      </Link>
      <PageHeading
        eyebrow="A SMALL PROJECT CAN OPEN A BIG DOOR"
        title="Post a task"
        description="Be specific about the problem, deliverable, and definition of done."
      />
      <Card>
        <form onSubmit={submit} className="form-stack">
          <ErrorMessage error={mutation.error} />
          <Field label="Task title" id="title">
            <Input
              id="title"
              name="title"
              placeholder="Build a responsive analytics view"
              minLength={5}
              maxLength={160}
              required
            />
          </Field>
          <Field
            label="The opportunity"
            id="description"
            hint="Public information only. Add private files after creating the task."
          >
            <Textarea
              id="description"
              name="description"
              minLength={30}
              maxLength={10000}
              required
            />
          </Field>
          <Field label="Acceptance criteria" id="acceptance_criteria">
            <Textarea
              id="acceptance_criteria"
              name="acceptance_criteria"
              placeholder="What must the finished work include? How will you review it?"
              minLength={10}
              maxLength={6000}
              required
            />
          </Field>
          <div className="form-grid">
            <Field label="Category" id="category">
              <Select id="category" name="category">
                {Object.entries(categories).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Difficulty" id="difficulty">
              <Select id="difficulty" name="difficulty">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Select>
            </Field>
          </div>
          <div className="form-grid">
            <Field label="Estimated hours" id="estimated_hours">
              <Input
                id="estimated_hours"
                name="estimated_hours"
                type="number"
                min={1}
                max={500}
                defaultValue={6}
                required
              />
            </Field>
            <Field label="Skills" id="skills" hint="Comma separated, up to 15.">
              <Input id="skills" name="skills" placeholder="React, TypeScript" maxLength={600} />
            </Field>
          </div>
          <label className="check-label">
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
              hint="The selected student must accept this exact version. Terms lock after selection."
            >
              <Textarea
                id="agreement_text"
                name="agreement_text"
                minLength={20}
                maxLength={12000}
                required
              />
            </Field>
          )}
          <Button type="submit" busy={mutation.isPending}>
            Publish task →
          </Button>
        </form>
      </Card>
    </div>
  );
}
export function ManageTaskPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const task = useApiQuery<{ task: Task }>(['task', id], `/tasks/${id}`);
  const proposals = useApiQuery<{ items: Proposal[] }>(
    ['task-proposals', id],
    `/tasks/${id}/proposals`,
  );
  const files = useApiQuery<{ items: FileAsset[] }>(['task-files', id], `/tasks/${id}/files`);
  const assignments = useApiQuery<{ items: Assignment[] }>(['assignments'], '/assignments');
  const select = useAction<{ assignment: Assignment }, { id: string }>(
    (input) => `/tasks/${id}/proposals/${input.id}/select`,
  );
  const upload = useAction(`/tasks/${id}/files`);
  const close = useAction(`/tasks/${id}/close`);
  function uploadFile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    upload.mutate(new FormData(form), { onSuccess: () => form.reset() });
  }
  if (task.isPending || proposals.isPending || files.isPending) return <Loading />;
  const error = task.error || proposals.error || files.error;
  if (error)
    return (
      <ErrorMessage
        error={error}
        retry={() => {
          void task.refetch();
          void proposals.refetch();
          void files.refetch();
        }}
      />
    );
  const current = task.data!.task;
  const assigned = assignments.data?.items.find((a) => a.task.id === id);
  return (
    <>
      <Link className="back-link" to="/business/tasks">
        ← My tasks
      </Link>
      <PageHeading
        eyebrow="TASK MANAGEMENT"
        title={current.title}
        action={<StatusBadge status={current.status} />}
      />
      <ErrorMessage error={select.error || close.error} />
      {assigned && (
        <div className="notice notice-success row between">
          <span>This task has an assignment.</span>
          <Link className="button button-primary" to={`/assignments/${assigned.id}`}>
            Open assignment →
          </Link>
        </div>
      )}
      <div className="detail-grid">
        <div>
          <div className="section-heading">
            <h2>Student proposals</h2>
            <span className="muted">{proposals.data!.items.length} received</span>
          </div>
          {proposals.data!.items.length ? (
            <div className="list-stack">
              {proposals.data!.items.map((proposal) => (
                <Card key={proposal.id}>
                  <div className="row between">
                    <h3>
                      <Link to={`/profiles/${proposal.student.id}`}>
                        {fullName(proposal.student)}
                      </Link>
                    </h3>
                    <StatusBadge status={proposal.status} />
                  </div>
                  <p className="muted text-sm">
                    Estimated effort: {proposal.estimated_hours} hours
                  </p>
                  <p className="preserve-text">{proposal.message}</p>
                  <Link className="text-link" to={`/profiles/${proposal.student.id}`}>
                    View student profile →
                  </Link>
                  {current.status === 'open' && proposal.status === 'pending' && (
                    <ConfirmDialog
                      trigger={
                        <Button className="mt-4" busy={select.isPending}>
                          Select student
                        </Button>
                      }
                      title={`Select ${fullName(proposal.student)}?`}
                      description="This creates one assignment and closes the other proposals. Starter files will be locked for editing."
                    >
                      <Button
                        busy={select.isPending}
                        onClick={() =>
                          select.mutate(
                            { id: proposal.id },
                            {
                              onSuccess: (result) =>
                                navigate(`/assignments/${result.assignment.id}`),
                            },
                          )
                        }
                      >
                        Confirm selection
                      </Button>
                      <ErrorMessage error={select.error} />
                    </ConfirmDialog>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState title="The right introduction is on its way.">
              Students can now discover your task and send a proposal.
            </EmptyState>
          )}
        </div>
        <aside className="list-stack">
          <Card>
            <h2>Private starter files</h2>
            <p className="muted text-sm">
              Only you and the selected student can download these. Agreement requirements are
              enforced on every download.
            </p>
            {files.data!.items.map((file) => (
              <a key={file.id} className="file-link" href={fileUrl(file.id)}>
                {file.filename} <span>↓</span>
              </a>
            ))}
            {current.status === 'open' && (
              <form className="form-stack mt-4" onSubmit={uploadFile}>
                <ErrorMessage error={upload.error} />
                <Field
                  label="Starter ZIP"
                  id="starter"
                  hint="Up to 8 MB. Include a README. Exclude secrets, .git, and node_modules."
                >
                  <Input
                    id="starter"
                    name="file"
                    type="file"
                    accept=".zip,application/zip"
                    required
                  />
                </Field>
                <Button type="submit" variant="secondary" busy={upload.isPending}>
                  Upload starter files
                </Button>
              </form>
            )}
          </Card>
          <Card>
            <h3>Task controls</h3>
            <Link className="text-link" to={`/tasks/${id}`}>
              View public task →
            </Link>
            {current.status === 'open' && (
              <ConfirmDialog
                trigger={
                  <Button variant="danger" className="mt-4">
                    Close task
                  </Button>
                }
                title="Close this task?"
                description="This stops new proposals and rejects the pending proposals. You can post a new task later."
              >
                <Button variant="danger" busy={close.isPending} onClick={() => close.mutate({})}>
                  Confirm close
                </Button>
                <ErrorMessage error={close.error} />
              </ConfirmDialog>
            )}
          </Card>
        </aside>
      </div>
    </>
  );
}
