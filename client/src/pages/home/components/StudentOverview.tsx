import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorMessage, Loading, buttonClass } from '@/components/ui';
import links from '@/styles/links.module.css';
import { cx } from '@/utils/cx';
import { Svg } from '@/pages/discover/components/Svg';
import { TaskRow } from '@/pages/discover/components/TaskRow';
import { ICONS } from '@/pages/discover/constants/discover';
import { useGetAllTasks } from '@/pages/discover/hooks';
import { useSavedTasks } from '@/pages/discover/hooks/use-saved-tasks';
import { recommendTasks } from '@/pages/discover/utils/filter-tasks';
import discover from '@/pages/discover/DiscoverPage.module.css';
import {
  STUDENT_FOR_YOU_COUNT,
  OVERVIEW_ICONS,
  STUDENT_OVERVIEW_STATS,
  STUDENT_OVERVIEW_TABS,
} from '../constants/overview';
import type { StudentOverviewStatKey, StudentOverviewTab } from '../constants/overview';
import { getGreeting } from '../utils/get-greeting';
import styles from '../HomePage.module.css';

export function StudentOverview({
  firstName,
  skills,
  counts,
}: {
  firstName: string;
  skills: string[];
  counts: Record<StudentOverviewStatKey, number>;
}) {
  const [tab, setTab] = useState<StudentOverviewTab>('forYou');
  const { data: allTasks = [], isPending, isError, error, refetch } = useGetAllTasks();
  const { ids: savedIds, isSaved } = useSavedTasks();

  const tasks =
    tab === 'forYou'
      ? recommendTasks(allTasks, skills, STUDENT_FOR_YOU_COUNT)
      : allTasks.filter((task) => isSaved(task.id));

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>Student workspace</p>
          <h1 className={styles.heroTitle}>
            {getGreeting()}, <span className={styles.accent}>{firstName}.</span>
          </h1>
          <p className={styles.heroLead}>Real projects. Real companies. Real experience.</p>
          <p className={styles.heroDescription}>
            Discover opportunities, build your skills, and create a portfolio that gets you noticed.
          </p>
          <div className={styles.heroActions}>
            <Link className={buttonClass()} to="/tasks">
              Explore opportunities
              <Svg d={ICONS.arrow} size={14} />
            </Link>
            <Link className={buttonClass('secondary')} to="/student/proposals">
              View my applications
            </Link>
          </div>
        </div>
      </section>

      <ul className={styles.stats}>
        {STUDENT_OVERVIEW_STATS.map(({ key, label, hint, to, icon }) => (
          <li key={key}>
            <Link className={styles.stat} to={to}>
              <span className={styles.statIcon}>
                <Svg d={OVERVIEW_ICONS[icon]} size={22} />
              </span>
              <span className={styles.statBody}>
                <strong>{counts[key]}</strong>
                <span>{label}</span>
                <small>{hint}</small>
              </span>
              <Svg d={ICONS.chevron} size={18} className={styles.statArrow} />
            </Link>
          </li>
        ))}
      </ul>

      <section aria-label="Recommended for you">
        <div className={styles.toolbar}>
          <h2 className={styles.sectionTitle}>Recommended for you</h2>
          <div className={styles.tabs} role="tablist" aria-label="Recommended projects">
            {Object.entries(STUDENT_OVERVIEW_TABS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                className={cx(styles.tab, tab === key && styles.tabActive)}
                onClick={() => setTab(key as StudentOverviewTab)}
              >
                {label}
                {key === 'saved' && savedIds.length > 0 && (
                  <span className={styles.count}>{savedIds.length}</span>
                )}
              </button>
            ))}
          </div>
          <Link className={cx(links.textLink, styles.viewAll)} to="/tasks">
            View all →
          </Link>
        </div>

        {isPending ? (
          <Loading />
        ) : isError ? (
          <ErrorMessage error={error} retry={() => refetch()} />
        ) : tasks.length ? (
          <ul className={discover.list}>
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </ul>
        ) : (
          <EmptyState
            title={tab === 'saved' ? 'No saved projects yet' : 'No open projects right now'}
            action={
              <Link to="/tasks" className={links.textLink}>
                Browse all projects →
              </Link>
            }
          >
            {tab === 'saved'
              ? 'Tap the bookmark on any project to keep it here.'
              : 'Check back soon, new projects are posted regularly.'}
          </EmptyState>
        )}
      </section>
    </div>
  );
}