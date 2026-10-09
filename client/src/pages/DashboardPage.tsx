import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useApiQuery } from '../lib/queries';
import type { Assignment, Proposal, Task } from '../lib/types';
import {
  Card,
  EmptyState,
  ErrorMessage,
  Loading,
  PageHeading,
  StatusBadge,
} from '../components/ui';
import { TaskCard } from '../components/TaskCard';
export default function DashboardPage() {
  const { user } = useAuth();
  const student = user?.role === 'student';
  const assignments = useApiQuery<{ items: Assignment[] }>(['assignments'], '/assignments');
  const tasks = useApiQuery<{ items: Task[] }>(['my-tasks'], '/my/tasks', !student);
  const proposals = useApiQuery<{ items: Proposal[] }>(['my-proposals'], '/my/proposals', student);
  const items = assignments.data?.items || [];
  const active = items.filter((a) => !['completed', 'rejected'].includes(a.status));
  const stats = student
    ? [
        ['Active projects', active.length],
        ['Proposals sent', proposals.data?.items.length || 0],
        ['Completed projects', items.filter((a) => a.status === 'completed').length],
      ]
    : [
        ['Open tasks', tasks.data?.items.filter((t) => t.status === 'open').length || 0],
        ['Active assignments', active.length],
        ['Awaiting review', items.filter((a) => a.status === 'submitted').length],
      ];
  if (assignments.isPending || (student ? proposals.isPending : tasks.isPending))
    return <Loading />;
  const error = assignments.error || (student ? proposals.error : tasks.error);
  return (
    <>
      <PageHeading
        eyebrow={student ? 'STUDENT WORKSPACE' : 'BUSINESS WORKSPACE'}
        title={`Welcome back, ${user?.first_name}.`}
        description={
          student
            ? 'Your next opportunity to turn what you know into what you can do.'
            : 'Move your backlog forward. Give emerging talent a meaningful start.'
        }
        action={
          <Link className="button button-primary" to={student ? '/tasks' : '/business/tasks/new'}>
            {student ? 'Explore tasks ↗' : '+ Post a task'}
          </Link>
        }
      />
      <ErrorMessage
        error={error}
        retry={() => {
          void assignments.refetch();
          if (student) void proposals.refetch();
          else void tasks.refetch();
        }}
      />
      {!error && (
        <div className="stats-grid">
          {stats.map(([label, value]) => (
            <Card className="stat-card" key={label}>
              <p>{label}</p>
              <strong>{value}</strong>
            </Card>
          ))}
        </div>
      )}
      <div className="section-heading">
        <h2>{student ? 'Your work in motion' : 'Assignment activity'}</h2>
        <Link className="text-link" to="/assignments">
          View all →
        </Link>
      </div>
      {items.length ? (
        <div className="list-stack">
          {items.slice(0, 5).map((item) => (
            <Link className="card assignment-row" key={item.id} to={`/assignments/${item.id}`}>
              <div>
                <h3>{item.task.title}</h3>
                <p className="muted">{item.task.company.name}</p>
              </div>
              <StatusBadge status={item.status} />
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            student
              ? 'Your first project starts with a proposal.'
              : 'Create room for a fresh perspective.'
          }
          action={
            <Link to={student ? '/tasks' : '/business/tasks/new'} className="text-link">
              {student ? 'Discover opportunities →' : 'Post your first task →'}
            </Link>
          }
        >
          {student
            ? 'Explore open tasks, tell a company how you would approach their problem, and get selected.'
            : 'Post a focused task with clear acceptance criteria. Review proposals and choose a student.'}
        </EmptyState>
      )}
      {!student && !!tasks.data?.items.length && (
        <>
          <div className="section-heading">
            <h2>Your latest tasks</h2>
            <Link className="text-link" to="/business/tasks">
              View all →
            </Link>
          </div>
          <div className="task-grid">
            {tasks.data.items.slice(0, 3).map((task) => (
              <TaskCard key={task.id} task={task} manage />
            ))}
          </div>
        </>
      )}
      <Card className="journey-callout">
        <div>
          <span className="eyebrow">EXPERIENCE THAT MEANS SOMETHING</span>
          <h2>{student ? 'Your work tells your story.' : 'Clear scope. Better outcomes.'}</h2>
          <p className="muted">
            {student
              ? 'Approved projects appear on your profile with the business review, skills, and completion date.'
              : 'Define a small deliverable, provide safe starter files, and give actionable feedback.'}
          </p>
        </div>
        <Link className="button button-secondary" to={student ? '/profile' : '/business/tasks/new'}>
          {student ? 'View my profile' : 'Create a task'}
        </Link>
      </Card>
    </>
  );
}
