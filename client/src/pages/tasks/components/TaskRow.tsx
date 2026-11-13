import { Link } from 'react-router-dom';
import { buttonClass } from '@/components/ui';
import { DIFFICULTY_LABELS, TASK_TYPE_LABELS } from '@/constants/tasks';
import { cx } from '@/utils/cx';
import { formatEstimate } from '@/utils/task-display';
import { ICONS, tint } from '../constants/discover';
import type { AvailableTask } from '../hooks';
import { useSavedTasks } from '../hooks/use-saved-tasks';
import { CompanyLogo } from './CompanyLogo';
import { Svg } from './Svg';
import styles from '../TasksPage.module.css';

export function TaskRow({ task }: { task: AvailableTask }) {
  const { isSaved, toggle } = useSavedTasks();
  const saved = isSaved(task.id);
  const href = `/tasks/${task.id}`;

  return (
    <li className={styles.row}>
      <CompanyLogo name={task.Company.name} className={styles.logo} style={tint(task.task_type)} />

      <div className={styles.rowMain}>
        <h2 className={styles.rowTitle}>
          <Link to={href}>{task.title}</Link>
        </h2>
        <p className={styles.rowMeta}>
          <span>{task.Company.name}</span>
          {task.Company.verification_status === 'verified' && (
            <Svg d={ICONS.shield} size={14} className={styles.verified} />
          )}
          <span aria-hidden="true">·</span>
          <span>Remote</span>
          <span className={styles.tag}>
            {TASK_TYPE_LABELS[task.task_type]?.label ?? task.task_type}
          </span>
        </p>
      </div>

      <dl className={styles.facts}>
        <div>
          <dt>
            <Svg d={ICONS.calendar} size={15} />
            <span className={styles.srOnly}>Estimated time</span>
          </dt>
          <dd>{task.estimated_hours !== null ? formatEstimate(task.estimated_hours) : '—'}</dd>
        </div>
        <div>
          <dt>
            <Svg d={ICONS.bars} size={15} />
            <span className={styles.srOnly}>Difficulty</span>
          </dt>
          <dd>{DIFFICULTY_LABELS[task.difficulty]}</dd>
        </div>
      </dl>

      <div className={styles.rowActions}>
        <button
          type="button"
          className={cx(styles.save, saved && styles.saveActive)}
          aria-pressed={saved}
          aria-label={`Save ${task.title}`}
          onClick={() => toggle(task.id)}
        >
          <Svg d={ICONS.bookmark} size={18} />
        </button>
        <Link to={href} className={buttonClass('dark', styles.view)}>
          View
          <Svg d={ICONS.arrow} size={14} />
        </Link>
      </div>
    </li>
  );
}
