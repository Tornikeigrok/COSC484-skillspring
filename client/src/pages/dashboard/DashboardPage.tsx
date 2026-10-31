import { Link } from 'react-router-dom';
import {
  Card,
  EmptyState,
  ErrorMessage,
  Loading,
  PageHeading,
  StatusBadge,
  buttonClass,
} from '../../components/ui';
import { TaskCard } from '../../components/TaskCard';
import layout from '../../styles/layout.module.css';
import linkCard from '../../styles/link-card.module.css';
import links from '../../styles/links.module.css';
import text from '../../styles/text.module.css';
import { useCurrentUser } from './hooks/use-profile';
import {
  sampleDashboardAssignments,
  sampleDashboardProposals,
  sampleDashboardTasks,
} from './constants/sample-dashboard';
import { getActiveAssignments } from './utils/get-active-assignments';
import styles from './DashboardPage.module.css';




export default function DashboardPage() {
  const { data: profile, isPending, error, refetch } = useCurrentUser();
  if (isPending) return <Loading />;
  if (!profile) return <ErrorMessage error={error} retry={() => refetch()} />;


  const student = profile.role === 'student';
  const tasks = sampleDashboardTasks;
  const proposals = sampleDashboardProposals;
  const items = sampleDashboardAssignments;
  const active = getActiveAssignments(items);
  const stats = student
    ? [
        ['Active projects', active.length],
        ['Proposals sent', proposals.length],
        ['Completed projects', items.filter((a) => a.status === 'completed').length],
      ]
    : [
        ['Open tasks', tasks.filter((t) => t.status === 'open').length],
        ['Active assignments', active.length],
        ['Awaiting review', items.filter((a) => a.status === 'submitted').length],
      ];


  return (
    <>
      <PageHeading
        eyebrow={student ? 'STUDENT WORKSPACE' : 'BUSINESS WORKSPACE'}
        title={`Welcome back, ${profile.first_name}.`}
        description={
          student
            ? 'Your next opportunity to turn what you know into what you can do.'
            : 'Move your backlog forward. Give emerging talent a meaningful start.'
        }
        action={
          <Link className={buttonClass()} to={student ? '/tasks' : '/business/tasks/new'}>
            {student ? 'Explore tasks ↗' : '+ Post a task'}
          </Link>
        }
      />
      <div className={styles.stats}>
        {stats.map(([label, value]) => (
          <Card className={styles.stat} key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
          </Card>
        ))}
      </div>
      <div className={layout.sectionBar}>
        <h2>{student ? 'Your work in motion' : 'Assignment activity'}</h2>
        <Link className={links.textLink} to="/assignments">
          View all →
        </Link>
      </div>
      {items.length ? (
        <div className={layout.stack}>
          {items.slice(0, 5).map((item) => (
            <Link className={linkCard.linkCard} key={item.id} to={`/assignments/${item.id}`}>
              <div>
                <h3>{item.task.title}</h3>
                <p className={text.muted}>{item.task.company.name}</p>
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
            <Link to={student ? '/tasks' : '/business/tasks/new'} className={links.textLink}>
              {student ? 'Discover opportunities →' : 'Post your first task →'}
            </Link>
          }
        >
          {student
            ? 'Explore open tasks, tell a company how you would approach their problem, and get selected.'
            : 'Post a focused task with clear acceptance criteria. Review proposals and choose a student.'}
        </EmptyState>
      )}
      {!student && !!tasks.length && (
        <>
          <div className={layout.sectionBar}>
            <h2>Your latest tasks</h2>
            <Link className={links.textLink} to="/business/tasks">
              View all →
            </Link>
          </div>
          <div className={layout.cardGrid}>
            {tasks.slice(0, 3).map((task) => (
              <TaskCard key={task.id} task={task} manage />
            ))}
          </div>
        </>
      )}
      <Card className={styles.promo}>
        <div>
          <span className={styles.promoEyebrow}>EXPERIENCE THAT MEANS SOMETHING</span>
          <h2 className={styles.promoTitle}>
            {student ? 'Your work tells your story.' : 'Clear scope. Better outcomes.'}
          </h2>
          <p className={styles.promoText}>
            {student
              ? 'Approved projects appear on your profile with the business review, skills, and completion date.'
              : 'Define a small deliverable, provide safe starter files, and give actionable feedback.'}
          </p>
        </div>
        <Link
          className={buttonClass('secondary', styles.promoButton)}
          to={student ? '/profile' : '/business/tasks/new'}
        >
          {student ? 'View my profile' : 'Create a task'}
        </Link>
      </Card>
    </>
  );
}
