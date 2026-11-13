import { Link } from 'react-router-dom';
import { DateLabel, EmptyState, ErrorMessage, Loading, buttonClass } from '@/components/ui';
import { STATUS_LABELS } from '@/constants/status';
import { DIFFICULTY_LABELS, TASK_TYPE_LABELS } from '@/constants/tasks';
import links from '@/styles/links.module.css';
import { cx } from '@/utils/cx';
import { formatEstimate } from '@/utils/task-display';
import { CompanyLogo } from '@/pages/discover/components/CompanyLogo';
import { Svg } from '@/pages/discover/components/Svg';
import { ICONS, tint } from '@/pages/discover/constants/discover';
import discover from '@/pages/discover/DiscoverPage.module.css';
import { matches } from '@/pages/business-tasks/constants/posted-tasks';
import { useFetchAllTasks } from '@/pages/business-tasks/hooks';
import {
  COMPANY_OVERVIEW_STATS,
  COMPANY_RECENT_TASKS_COUNT,
  OVERVIEW_ICONS,
} from '../constants/overview';
import type { CompanyOverviewStatKey } from '../constants/overview';
import { getGreeting } from '../utils/get-greeting';
import styles from '../HomePage.module.css';

export function CompanyOverview({
  firstName,
  companyName,
}: {
  firstName: string;
  companyName: string;
}) {
  const { data: tasks = [], isPending, isError, error, refetch } = useFetchAllTasks();

  const recent = [...tasks]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, COMPANY_RECENT_TASKS_COUNT);

  const counts: Record<CompanyOverviewStatKey, number> = {
    open: tasks.filter((task) => matches('open', task.status)).length,
    proposals: tasks.reduce((sum, task) => sum + (task.proposal_count ?? 0), 0),
    review: tasks.filter((task) => matches('review', task.status)).length,
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>Business workspace</p>
          <h1 className={styles.heroTitle}>
            {getGreeting()}, <span className={styles.accent}>{firstName}.</span>
          </h1>
          <p className={styles.heroLead}>Real work. Fresh talent. Clear results.</p>
          <p className={styles.heroDescription}>
            Post focused tasks, review proposals, and give students their first real experience.
          </p>
          <div className={styles.heroActions}>
            <Link className={buttonClass()} to="/business/tasks/new">
              + Post a task
            </Link>
            <Link className={buttonClass('secondary')} to="/business/tasks">
              View all tasks
            </Link>
          </div>
        </div>
      </section>

      <ul className={styles.stats}>
        {COMPANY_OVERVIEW_STATS.map(({ key, label, hint, icon }) => (
          <li key={key}>
            <Link className={styles.stat} to="/business/tasks">
              <span className={styles.statIcon}>
                <Svg d={OVERVIEW_ICONS[icon]} size={22} />
              </span>
              <span className={styles.statBody}>
                <strong>{isPending ? '–' : counts[key]}</strong>
                <span>{label}</span>
                <small>{hint}</small>
              </span>
              <Svg d={ICONS.chevron} size={18} className={styles.statArrow} />
            </Link>
          </li>
        ))}
      </ul>

      <section aria-label="Recently posted tasks">
        <div className={styles.toolbar}>
          <h2 className={styles.sectionTitle}>Recently posted tasks</h2>
          <Link className={cx(links.textLink, styles.viewAll)} to="/business/tasks">
            View all →
          </Link>
        </div>

        {isPending ? (
          <Loading />
        ) : isError ? (
          <ErrorMessage error={error} retry={() => refetch()} />
        ) : recent.length ? (
          <ul className={discover.list}>
            {recent.map((task) => {
              const href = `/business/tasks/${task.id}/proposals`;
              return (
                <li key={task.id} className={discover.row}>
                  <CompanyLogo
                    name={companyName}
                    className={discover.logo}
                    style={tint(task.task_type)}
                  />

                  <div className={discover.rowMain}>
                    <h2 className={discover.rowTitle}>
                      <Link to={href}>{task.title}</Link>
                    </h2>
                    <p className={discover.rowMeta}>
                      <span>
                        Posted <DateLabel value={task.created_at} />
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{STATUS_LABELS[task.status] ?? task.status}</span>
                      <span className={discover.tag}>
                        {TASK_TYPE_LABELS[task.task_type]?.label ?? task.task_type}
                      </span>
                    </p>
                  </div>

                  <dl className={discover.facts}>
                    <div>
                      <dt>
                        <Svg d={ICONS.calendar} size={15} />
                        <span className={discover.srOnly}>Estimated time</span>
                      </dt>
                      <dd>
                        {task.estimated_hours !== null ? formatEstimate(task.estimated_hours) : '—'}
                      </dd>
                    </div>
                    <div>
                      <dt>
                        <Svg d={ICONS.bars} size={15} />
                        <span className={discover.srOnly}>Difficulty</span>
                      </dt>
                      <dd>{DIFFICULTY_LABELS[task.difficulty]}</dd>
                    </div>
                  </dl>

                  <div className={discover.rowActions}>
                    <Link to={href} className={buttonClass('dark', discover.view)}>
                      View
                      <Svg d={ICONS.arrow} size={14} />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            title="No tasks posted yet"
            action={
              <Link to="/business/tasks/new" className={links.textLink}>
                Post your first task →
              </Link>
            }
          >
            Start with a small, well-defined piece of work. It will show up here once it's posted.
          </EmptyState>
        )}
      </section>
    </div>
  );
}