import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import { useAction, useApiQuery } from '../lib/queries';
import { useAuth } from '../lib/auth';
import { fileUrl } from '../lib/api';
import type { Agreement, Assignment, AssignmentDetail, Review, ValidationRun } from '../lib/types';
import { fullName } from '../lib/types';
import {
  Badge,
  Button,
  Card,
  DateLabel,
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
export function AssignmentsPage() {
  const query = useApiQuery<{ items: Assignment[] }>(['assignments'], '/assignments');
  return (
    <>
      <PageHeading
        eyebrow="FROM APPROACH TO IMPACT"
        title="Your assignments"
        description="Everything you need to move your work forward."
      />
      <ErrorMessage error={query.error} retry={() => query.refetch()} />
      {query.isPending ? (
        <Loading />
      ) : query.data?.items.length ? (
        <div className="list-stack">
          {query.data.items.map((item) => (
            <Link className="card assignment-row" key={item.id} to={`/assignments/${item.id}`}>
              <div>
                <h2>{item.task.title}</h2>
                <p className="muted">
                  {item.task.company.name} · {fullName(item.student)}
                </p>
              </div>
              <StatusBadge status={item.status} />
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      ) : (
        !query.error && (
          <EmptyState title="A place for work in progress.">
            Assignments appear here after a business selects a student’s proposal.
          </EmptyState>
        )
      )}
    </>
  );
}
function AgreementPanel({
  agreement,
  assignmentId,
  canAccept,
}: {
  agreement: Agreement | null;
  assignmentId: string;
  canAccept: boolean;
}) {
  const mutation = useAction(`/assignments/${assignmentId}/agreement`);
  const navigate = useNavigate();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    mutation.mutate(
      {
        accepted: data.get('accepted') === 'on',
        accepted_name: data.get('accepted_name'),
        version: agreement!.version,
      },
      { onSuccess: () => navigate(`/assignments/${assignmentId}`) },
    );
  }
  if (!agreement)
    return (
      <Card>
        <h2>No agreement required</h2>
        <p className="muted">The business did not require an access agreement for this task.</p>
      </Card>
    );
  return (
    <Card>
      <div className="row between">
        <h2>Access agreement</h2>
        <Badge>Version {agreement.version}</Badge>
      </div>
      <p className="muted">Read the terms before accessing private starter files.</p>
      <div className="agreement-terms preserve-text">{agreement.text}</div>
      {agreement.accepted_at ? (
        <div className="notice notice-success">
          Accepted by {agreement.accepted_name} on <DateLabel value={agreement.accepted_at} />.
        </div>
      ) : canAccept ? (
        <form className="form-stack" onSubmit={submit}>
          <ErrorMessage error={mutation.error} />
          <Field label="Your full name" id="accepted_name">
            <Input
              id="accepted_name"
              name="accepted_name"
              required
              minLength={2}
              maxLength={200}
              autoComplete="name"
            />
          </Field>
          <label className="check-label">
            <input name="accepted" type="checkbox" required />I have read and accept these access
            terms.
          </label>
          <Button type="submit" busy={mutation.isPending}>
            Accept agreement and unlock files
          </Button>
        </form>
      ) : (
        <p className="notice">Waiting for the selected student to accept.</p>
      )}
    </Card>
  );
}
function SubmitPanel({ assignment }: { assignment: Assignment }) {
  const mutation = useAction<{ validation: ValidationRun }>(
    `/assignments/${assignment.id}/submissions`,
  );
  const navigate = useNavigate();
  const allowed = ['in_progress', 'changes_requested', 'validation_failed'].includes(
    assignment.status,
  );
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    mutation.mutate(new FormData(form), {
      onSuccess: () => navigate(`/assignments/${assignment.id}/validation`),
    });
  }
  return (
    <Card>
      <h2>Submit your work</h2>
      <p className="muted">
        Package your solution with a README that explains setup, testing, and your changes.
      </p>
      {allowed ? (
        <form className="form-stack" onSubmit={submit}>
          <ErrorMessage error={mutation.error} />
          <Field
            label="Solution ZIP"
            id="solution"
            hint="8 MB maximum. Up to 250 files and 40 MB expanded. Exclude secrets, .git, and node_modules."
          >
            <Input id="solution" name="file" type="file" accept=".zip,application/zip" required />
          </Field>
          <Field label="Submission notes" id="notes">
            <Textarea
              id="notes"
              name="notes"
              maxLength={6000}
              placeholder="What changed? How did you test it? What should the reviewer know?"
            />
          </Field>
          <p className="notice">
            We check archive integrity, paths, size limits, and common credential patterns. Your
            code is not executed. The business reviews functionality separately.
          </p>
          <Button type="submit" busy={mutation.isPending}>
            Upload and check archive →
          </Button>
        </form>
      ) : (
        <p className="notice">
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
function ReviewPanel({ detail }: { detail: AssignmentDetail }) {
  const latest = detail.submissions[0];
  const [decision, setDecision] = useState<Review['decision']>('approved');
  const mutation = useAction(`/submissions/${latest?.id}/reviews`);
  const navigate = useNavigate();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    mutation.mutate(
      {
        decision,
        feedback: fields.get('feedback'),
        ...(decision === 'approved'
          ? { rating: Number(fields.get('rating')), public_summary: fields.get('public_summary') }
          : {}),
      },
      { onSuccess: () => navigate(`/assignments/${detail.assignment.id}`) },
    );
  }
  if (!latest || detail.assignment.status !== 'submitted')
    return (
      <Card>
        <h2>Company review</h2>
        <p className="muted">
          A submission that passes archive checks must be awaiting review before you can make a
          decision.
        </p>
      </Card>
    );
  return (
    <Card>
      <h2>Review version {latest.version}</h2>
      <p className="muted">
        Download and inspect the work against your acceptance criteria. Archive checks do not
        establish functional correctness.
      </p>
      <a className="file-link" href={fileUrl(latest.file.id)}>
        {latest.file.filename} <span>Download ↓</span>
      </a>
      <p className="preserve-text">{latest.notes}</p>
      <form className="form-stack" onSubmit={submit}>
        <ErrorMessage error={mutation.error} />
        <Field label="Review decision" id="decision">
          <Select
            id="decision"
            value={decision}
            onChange={(e) => setDecision(e.target.value as Review['decision'])}
          >
            <option value="approved">Approve work</option>
            <option value="changes_requested">Request changes</option>
            <option value="rejected">Reject and close assignment</option>
          </Select>
        </Field>
        <Field
          label="Feedback for the student"
          id="feedback"
          hint="Private to you and the student. Be specific and actionable."
        >
          <Textarea id="feedback" name="feedback" minLength={10} maxLength={6000} required />
        </Field>
        {decision === 'approved' && (
          <>
            <Field label="Rating" id="rating">
              <Select id="rating" name="rating" defaultValue="5">
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} / 5
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Public experience summary"
              id="public_summary"
              hint="This appears on the student’s profile. Do not include confidential information."
            >
              <Textarea
                id="public_summary"
                name="public_summary"
                minLength={10}
                maxLength={2000}
                required
              />
            </Field>
            <p className="notice notice-success">
              Approval creates one verified experience record with your rating and this public
              summary.
            </p>
          </>
        )}
        {decision === 'rejected' && (
          <p className="notice notice-error">
            Rejection closes this assignment without verified experience. Use “Request changes” if
            the student should revise their work.
          </p>
        )}
        <Button
          type="submit"
          busy={mutation.isPending}
          variant={decision === 'rejected' ? 'danger' : 'primary'}
        >
          {decision === 'approved'
            ? 'Approve and verify experience'
            : decision === 'changes_requested'
              ? 'Send revision request'
              : 'Reject submission'}
        </Button>
      </form>
    </Card>
  );
}
function ValidationPanel({ detail }: { detail: AssignmentDetail }) {
  return (
    <div className="list-stack">
      <Card className="subtle-card">
        <h2>What has been checked?</h2>
        <p>
          Archive checks validate file structure, integrity, size limits, and common credential
          patterns.
        </p>
        <p>
          <strong>Code execution is unavailable.</strong> No Docker container, test suite, or
          application code has been run. Passing these checks does not mean the solution works or
          that it is free of every possible secret.
        </p>
      </Card>
      {detail.validations.length ? (
        detail.submissions.map((submission) => {
          const run = detail.validations.find((v) => v.submission === submission.id);
          if (!run) return null;
          return (
            <Card key={run.id}>
              <div className="row between">
                <h2>Version {submission.version}</h2>
                <StatusBadge status={run.status} />
              </div>
              <p className="muted">
                {run.file_count} files inspected · {(run.uncompressed_bytes / 1024).toFixed(1)} KB
                expanded
              </p>
              {run.findings.length ? (
                <ul className="findings">
                  {run.findings.map((finding) => (
                    <li key={finding}>{finding}</li>
                  ))}
                </ul>
              ) : (
                <p className="notice notice-success">
                  Archive checks passed. This version can be reviewed by the business.
                </p>
              )}
              <p className="text-sm muted">Execution: not run</p>
            </Card>
          );
        })
      ) : (
        <EmptyState title="No validation runs yet.">
          Upload a solution ZIP to start archive checks.
        </EmptyState>
      )}
    </div>
  );
}
export function AssignmentPage({
  view = 'overview',
}: {
  view?: 'overview' | 'agreement' | 'submit' | 'review' | 'validation';
}) {
  const { id } = useParams();
  const { user } = useAuth();
  const query = useApiQuery<AssignmentDetail>(['assignment', id], `/assignments/${id}`);
  if (query.isPending) return <Loading />;
  if (query.error) return <ErrorMessage error={query.error} retry={() => query.refetch()} />;
  const detail = query.data!;
  const { assignment, agreement } = detail;
  const student = user?.role === 'student';
  const tabs = [
    ['', 'Overview'],
    ['/agreement', 'Agreement'],
    ['/validation', 'Validation'],
    ...(student ? [['/submit', 'Submit work']] : [['/review', 'Review work']]),
  ];
  return (
    <>
      <Link className="back-link" to="/assignments">
        ← Assignments
      </Link>
      <PageHeading
        eyebrow={assignment.task.company.name}
        title={assignment.task.title}
        description={`Student: ${fullName(assignment.student)}`}
        action={<StatusBadge status={assignment.status} />}
      />
      <nav className="tabs" aria-label="Assignment sections">
        {tabs.map(([suffix, label]) => (
          <NavLink key={suffix} end to={`/assignments/${id}${suffix}`}>
            {label}
          </NavLink>
        ))}
      </nav>
      {view === 'agreement' ? (
        <AgreementPanel agreement={agreement} assignmentId={id!} canAccept={student} />
      ) : view === 'submit' ? (
        student ? (
          <SubmitPanel assignment={assignment} />
        ) : (
          <p className="notice">Only the selected student can submit work.</p>
        )
      ) : view === 'review' ? (
        !student ? (
          <ReviewPanel detail={detail} />
        ) : (
          <p className="notice">Only the business owner can review submissions.</p>
        )
      ) : view === 'validation' ? (
        <ValidationPanel detail={detail} />
      ) : (
        <>
          <div className="workflow-progress" aria-label="Assignment progress">
            {['Selected', 'Access granted', 'Submitted', 'Approved'].map((step, index) => (
              <div
                key={step}
                className={
                  index === 0 ||
                  (index === 1 && assignment.status !== 'awaiting_agreement') ||
                  (index === 2 &&
                    detail.submissions.some((s) =>
                      detail.validations.some(
                        (v) => v.submission === s.id && v.status === 'passed',
                      ),
                    )) ||
                  (index === 3 && assignment.status === 'completed')
                    ? 'complete'
                    : ''
                }
              >
                <span>{index + 1}</span>
                {step}
              </div>
            ))}
          </div>
          {assignment.status === 'awaiting_agreement' && (
            <div className="notice row between">
              <p>Private files are locked until the student accepts the access agreement.</p>
              <Link className="button button-primary" to={`/assignments/${id}/agreement`}>
                View agreement →
              </Link>
            </div>
          )}
          {assignment.status === 'completed' && (
            <div className="notice notice-success row between">
              <p>Work approved. Verified experience has been added to the student profile.</p>
              <Link className="button button-secondary" to={`/profiles/${assignment.student.id}`}>
                View experience →
              </Link>
            </div>
          )}
          {assignment.status === 'rejected' && (
            <p className="notice notice-error">
              This assignment was closed without verified experience. Read the business feedback
              below.
            </p>
          )}
          <div className="detail-grid">
            <div className="list-stack">
              <Card>
                <h2>Definition of done</h2>
                <p className="preserve-text">{assignment.task.acceptance_criteria}</p>
                <Link className="text-link" to={`/tasks/${assignment.task.id}`}>
                  View full task →
                </Link>
              </Card>
              <Card>
                <div className="row between">
                  <h2>Submission history</h2>
                  {student &&
                    ['in_progress', 'changes_requested', 'validation_failed'].includes(
                      assignment.status,
                    ) && (
                      <Link className="button button-primary" to={`/assignments/${id}/submit`}>
                        Submit work →
                      </Link>
                    )}
                  {!student && assignment.status === 'submitted' && (
                    <Link className="button button-primary" to={`/assignments/${id}/review`}>
                      Review work →
                    </Link>
                  )}
                </div>
                {detail.submissions.length ? (
                  detail.submissions.map((submission) => {
                    const run = detail.validations.find((v) => v.submission === submission.id);
                    const review = detail.reviews.find((r) => r.submission === submission.id);
                    return (
                      <article className="submission-item" key={submission.id}>
                        <div className="row between">
                          <h3>Version {submission.version}</h3>
                          {run && <StatusBadge status={run.status} />}
                        </div>
                        <p className="text-sm muted">
                          <DateLabel value={submission.createdAt} />
                        </p>
                        <p className="preserve-text">{submission.notes || 'No notes added.'}</p>
                        {run?.status === 'passed' && (
                          <a className="text-link" href={fileUrl(submission.file.id)}>
                            Download {submission.file.filename} ↓
                          </a>
                        )}
                        {review && (
                          <div className="review-feedback">
                            <StatusBadge status={review.decision} />
                            <p className="preserve-text">{review.feedback}</p>
                            {review.rating && <p>Rating: {review.rating} / 5</p>}
                          </div>
                        )}
                      </article>
                    );
                  })
                ) : (
                  <p className="muted">
                    No submissions yet. Download the starter files and begin your work.
                  </p>
                )}
              </Card>
            </div>
            <aside className="list-stack">
              <Card>
                <h2>Project downloads</h2>
                {detail.files.length ? (
                  detail.files.map((file) => (
                    <a className="file-link" key={file.id} href={fileUrl(file.id)}>
                      <span>
                        {file.filename}
                        <small>{(file.size / 1024).toFixed(1)} KB</small>
                      </span>
                      ↓
                    </a>
                  ))
                ) : (
                  <p className="muted">
                    {assignment.status === 'awaiting_agreement'
                      ? 'Accept the agreement to see private files.'
                      : 'No starter files were provided. Follow the task description.'}
                  </p>
                )}
              </Card>
              <Card className="subtle-card">
                <h3>From work to proof</h3>
                <p className="muted text-sm">
                  Your submitted archive is checked before business review. Business approval is
                  what creates verified experience.
                </p>
                <Link className="text-link" to={`/assignments/${id}/validation`}>
                  View validation details →
                </Link>
              </Card>
            </aside>
          </div>
        </>
      )}
    </>
  );
}
