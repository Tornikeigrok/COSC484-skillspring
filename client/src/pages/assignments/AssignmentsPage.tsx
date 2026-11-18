import { Link } from 'react-router-dom';
import { EmptyState, ErrorMessage, Loading } from '../../components/ui';
import { DIFFICULTY_LABELS, TASK_TYPE_LABELS } from '../../constants/tasks';
import { formatEstimate, initials } from '../../utils/task-display';
import { useDisplayMyWork } from './hooks';
import styles from './AssignmentsPage.module.css';

interface MyWork {
  id: number;
  status: string;
  proposed_hours: number;
  created_at: string;
  nda_signed: boolean;
  Task: {
    id: number;
    title: string;
    task_type: keyof typeof TASK_TYPE_LABELS;
    difficulty: keyof typeof DIFFICULTY_LABELS;
    deadline: string | null;
    Company: { name: string } | null;
  };
}

const DAY = 24 * 60 * 60 * 1000;

// "Nov 24" plus how far away it is, so the urgent ones stand out
function dueLabel(iso: string | null) {
  if (!iso) return { date: '—', hint: '', tone: '' };
  const due = new Date(iso);
  const days = Math.ceil((due.getTime() - Date.now()) / DAY);
  const date = due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  if (days < 0) return { date, hint: `${-days}d overdue`, tone: styles.overdue };
  if (days === 0) return { date, hint: 'Today', tone: styles.soon };
  return { date, hint: `in ${days}d`, tone: days <= 2 ? styles.soon : '' };
}

export default function AssignmentsPage() {
  const { data, isPending, error, refetch } = useDisplayMyWork();
  const work = (data ?? []) as MyWork[];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Assignments</h1>
        <p className={styles.subtitle}>Tasks you’ve been selected for. Open one to get started.</p>
      </header>

      {isPending ? (
        <Loading />
      ) : error ? (
        <ErrorMessage error={error} retry={refetch} />
      ) : work.length ? (
        <div className={styles.table}>
          <div className={`${styles.row} ${styles.head}`} aria-hidden="true">
            <span>Task</span>
            <span className={styles.hideSm}>Type</span>
            <span className={styles.hideSm}>Difficulty</span>
            <span className={styles.hideSm}>Estimate</span>
            <span>Due</span>
          </div>

          {work.map(({ id, Task: task, proposed_hours }) => {
            const company = task.Company?.name ?? 'Company';
            const due = dueLabel(task.deadline);
            return (
              <Link key={id} className={styles.row} to={`/assignment/${task.id}`}>
                <span className={styles.task}>
                  <span className={styles.logo} aria-hidden="true">
                    {initials(company)}
                  </span>
                  <span className={styles.taskText}>
                    <span className={styles.taskTitle}>{task.title}</span>
                    <span className={styles.company}>{company}</span>
                  </span>
                </span>
                <span className={styles.hideSm}>
                  {TASK_TYPE_LABELS[task.task_type]?.label ?? task.task_type}
                </span>
                <span className={styles.hideSm}>
                  {DIFFICULTY_LABELS[task.difficulty] ?? task.difficulty}
                </span>
                <span className={styles.hideSm}>{formatEstimate(proposed_hours)}</span>
                <span className={styles.due}>
                  <span className={styles.dueDate}>{due.date}</span>
                  {due.hint && <span className={due.tone}>{due.hint}</span>}
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No assignments yet">
          Assignments appear here after a business selects your proposal.
        </EmptyState>
      )}
    </div>
  );
}
