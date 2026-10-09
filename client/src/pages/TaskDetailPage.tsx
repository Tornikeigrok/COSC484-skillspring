import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useApiQuery } from '../lib/queries';
import type { Task, Proposal } from '../lib/types';
import { categories } from '../lib/types';
import { Badge, Card, ErrorMessage, Loading, PageHeading, StatusBadge } from '../components/ui';
export default function TaskDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const query = useApiQuery<{ task: Task }>(['task', id], `/tasks/${id}`);
  const proposals = useApiQuery<{ items: Proposal[] }>(
    ['my-proposals'],
    '/my/proposals',
    user?.role === 'student',
  );
  if (query.isPending) return <Loading />;
  if (query.error) return <ErrorMessage error={query.error} retry={() => query.refetch()} />;
  const task = query.data!.task;
  const mine = proposals.data?.items.find((p) => p.task.id === id);
  return (
    <>
      <Link className="back-link" to="/tasks">
        ← Explore tasks
      </Link>
      <PageHeading
        eyebrow={categories[task.category]}
        title={task.title}
        description={task.company.name}
        action={<StatusBadge status={task.status} />}
      />
      <div className="detail-grid">
        <div className="list-stack">
          <Card>
            <h2>The opportunity</h2>
            <p className="preserve-text">{task.description}</p>
            <h2 className="mt-8">What success looks like</h2>
            <p className="preserve-text">{task.acceptance_criteria}</p>
            <h2 className="mt-8">Skills you’ll use</h2>
            <div className="tags">
              {task.skills.length ? (
                task.skills.map((skill) => <Badge key={skill}>{skill}</Badge>)
              ) : (
                <p className="muted">No specific tools required.</p>
              )}
            </div>
          </Card>
          <Card>
            <div className="row between">
              <h2>
                {task.company.user ? (
                  <Link to={`/profiles/${task.company.user}`}>About {task.company.name}</Link>
                ) : (
                  `About ${task.company.name}`
                )}
              </h2>
              <StatusBadge status={task.company.verification_status} />
            </div>
            <p className="preserve-text muted">
              {task.company.description || 'This company has not added a description yet.'}
            </p>
            {task.company.website && (
              <a className="text-link" href={task.company.website} target="_blank" rel="noreferrer">
                Company website ↗
              </a>
            )}
          </Card>
        </div>
        <aside className="list-stack">
          <Card className="task-summary">
            <h2>At a glance</h2>
            <dl>
              <div>
                <dt>Estimated effort</dt>
                <dd>{task.estimated_hours} hours</dd>
              </div>
              <div>
                <dt>Difficulty</dt>
                <dd className="capitalize">{task.difficulty}</dd>
              </div>
              <div>
                <dt>Work format</dt>
                <dd>Remote · Project based</dd>
              </div>
              <div>
                <dt>Private file access</dt>
                <dd>
                  {task.agreement_required
                    ? 'Agreement required after selection'
                    : 'Available after selection'}
                </dd>
              </div>
            </dl>
            {user?.role === 'company' ? (
              task.owner === user.id ? (
                <Link
                  className="button button-primary w-full"
                  to={`/business/tasks/${id}/proposals`}
                >
                  Manage task
                </Link>
              ) : (
                <p className="muted text-sm">Student accounts can submit proposals.</p>
              )
            ) : mine ? (
              <div className="notice">
                <p>
                  Your proposal is <strong>{mine.status}</strong>.
                </p>
                <Link
                  className="text-link"
                  to={mine.status === 'accepted' ? '/assignments' : '/student/proposals'}
                >
                  View your {mine.status === 'accepted' ? 'assignment' : 'proposals'} →
                </Link>
              </div>
            ) : task.status === 'open' ? (
              <Link
                className="button button-primary w-full"
                to={
                  user
                    ? `/tasks/${id}/propose`
                    : `/login?next=${encodeURIComponent(`/tasks/${id}/propose`)}`
                }
              >
                Submit a proposal →
              </Link>
            ) : (
              <p className="notice">This task is no longer accepting proposals.</p>
            )}
            <p className="text-sm muted mt-4">
              Completed work earns verified experience after business approval. Compensation is not
              handled by SkillSpring.
            </p>
          </Card>
          <Card className="subtle-card">
            <h3>Start with an approach.</h3>
            <p className="muted text-sm">
              Explain how you’ll solve the problem, what you’ll deliver, and how you’ll test your
              work.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}
