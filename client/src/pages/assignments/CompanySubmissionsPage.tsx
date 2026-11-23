import { Link } from 'react-router-dom';
import { DateLabel, EmptyState, ErrorMessage, Loading } from '../../components/ui';
import { useFetchAllTasks } from '../business-tasks/hooks';
import { initials } from '../../utils/task-display';
import { useTaskSubmissions } from './hooks';
import { cx } from '../../utils/cx';
import styles from './AssignmentsPage.module.css';

// Only tasks a student is working on (or finished) can have submissions
const WITH_WORK = ['in_progress', 'submitted', 'completed'];

export default function CompanySubmissionsPage() {
  const tasks = useFetchAllTasks();
  const working = (tasks.data ?? []).filter((t) => WITH_WORK.includes(t.status));
  const results = useTaskSubmissions(working.map((t) => t.id));

  const failed = tasks.error ?? results.find((r) => r.error)?.error;
  const rows = working
    .flatMap((task, i) => (results[i]?.data ?? []).map((sub) => ({ task, sub })))
    .sort((a, b) => b.sub.submitted_at.localeCompare(a.sub.submitted_at));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Submissions</h1>
        <p className={styles.subtitle}>Work students have submitted for your tasks.</p>
      </header>

      {tasks.isPending || results.some((r) => r.isPending) ? (
        <Loading />
      ) : failed ? (
        <ErrorMessage
          error={failed}
          retry={() => {
            tasks.refetch();
            results.forEach((r) => r.refetch());
          }}
        />
      ) : rows.length ? (
        <div className={styles.table}>
          <div className={cx(styles.row, styles.submissionRow, styles.head)} aria-hidden="true">
            <span>Task</span>
            <span className={styles.hideSm}>Student</span>
            <span>Submitted</span>
          </div>

          {rows.map(({ task, sub }) => {
            const user = sub.Student?.User;
            const name = user ? `${user.first_name} ${user.last_name}` : 'Student';
            return (
              <div key={sub.id} className={cx(styles.row, styles.submissionRow)}>
                <span className={styles.task}>
                  <span className={styles.logo} aria-hidden="true">
                    {initials(name)}
                  </span>
                  <span className={styles.taskText}>
                    <span className={styles.taskTitle}>{task.title}</span>
                    <span className={styles.company}>{sub.notes || 'No notes'}</span>
                  </span>
                </span>
                <span className={cx(styles.taskText, styles.hideSm)}>
                  {sub.Student ? (
                    <Link className={styles.taskTitle} to={`/profiles/${sub.Student.id}`}>
                      {name}
                    </Link>
                  ) : (
                    <span className={styles.taskTitle}>{name}</span>
                  )}
                  <span className={styles.company}>{user?.email}</span>
                </span>
                <span className={styles.dueDate}>
                  <DateLabel value={sub.submitted_at} />
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No submissions yet">
          Submissions appear here once a selected student uploads their work.
        </EmptyState>
      )}
    </div>
  );
}
