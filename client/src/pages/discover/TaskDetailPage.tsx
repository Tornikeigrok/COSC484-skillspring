import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge, ErrorMessage, Loading, buttonClass } from '../../components/ui';
import { DIFFICULTY_LABELS, TASK_TYPE_LABELS } from '../../constants/tasks';
import { cx } from '../../utils/cx';
import { formatEstimate, initials } from '../../utils/task-display';
import styles from './TaskDetailPage.module.css';
import { useGetTaskDetails } from './hooks';
import { useCurrentUser } from '../dashboard/hooks/use-profile';

const ICON = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

const TABS = ['Details', 'Files'] as const;

export default function TaskDetailPage() {
  const { id } = useParams();
  const { data: task, isPending, error, refetch } = useGetTaskDetails(id);
  const [tab, setTab] = useState<(typeof TABS)[number]>('Details');
  const [saved, setSaved] = useState(false);
  const { data: user } = useCurrentUser();

  if (isPending) return <Loading />;
  if (error) return <ErrorMessage error={error} retry={refetch} />;

  const company = task.Company;
  const verified = company?.verification_status === 'verified';
  // backend 403s proposals from unverified students, so gate the button here
  const mustVerify = user?.role === 'student' && user.Student.verification_status !== 'verified';

  return (
    <>
      <Link className={styles.back} to="/tasks">
        <svg {...ICON} width={16} height={16}>
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
        Back to tasks
      </Link>

      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>
            {TASK_TYPE_LABELS[task.task_type]?.label ?? task.task_type}
          </p>
          <h1 className={styles.title}>{task.title}</h1>
          {company && (
            <p className={styles.company}>
              <span className={styles.logo} aria-hidden="true">
                {initials(company.name)}
              </span>
              {company.name}
              {verified && (
                <svg className={styles.verified} viewBox="0 0 24 24" role="img">
                  <title>Verified company</title>
                  <circle cx="12" cy="12" r="10" fill="currentColor" />
                  <path d="m8 12 3 3 5-6" fill="none" stroke="#fff" strokeWidth="2.5" />
                </svg>
              )}
            </p>
          )}
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={cx(styles.save, saved && styles.saveActive)}
            aria-pressed={saved}
            aria-label={`Save ${task.title}`}
            onClick={() => setSaved(!saved)}
          >
            <svg {...ICON} fill={saved ? 'currentColor' : 'none'}>
              <path d="M6 3h12v18l-6-4-6 4z" />
            </svg>
          </button>
          {task.status !== 'open' ? (
            <Badge>No longer accepting proposals</Badge>
          ) : mustVerify ? (
            <button
              type="button"
              className={buttonClass('primary', styles.submit)}
              disabled
              aria-describedby="verify-hint"
            >
              <svg {...ICON} width={16} height={16}>
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              Submit a proposal
            </button>
          ) : (
            <Link className={buttonClass('primary', styles.submit)} to={`/tasks/${id}/propose`}>
              Submit a proposal
              <svg {...ICON} width={16} height={16}>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          )}
        </div>
      </header>

      {task.status === 'open' && mustVerify && (
        <p id="verify-hint" className={styles.verifyHint}>
          <svg {...ICON} width={16} height={16}>
            <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z" />
          </svg>
          <span>
            Verify your identity to submit proposals. Companies only review proposals from verified
            students.
          </span>
          <Link to="/verification">Verify now →</Link>
        </p>
      )}

      <div className={styles.tabs} role="tablist">
        {TABS.map((name) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={tab === name}
            className={cx(styles.tab, tab === name && styles.tabActive)}
            onClick={() => setTab(name)}
          >
            {name}
          </button>
        ))}
      </div>

      <div className={styles.split}>
        <div role="tabpanel">
          {tab === 'Details' ? (
            <>
              <section className={styles.section}>
                <svg {...ICON} className={styles.sectionIcon}>
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="12" cy="12" r="1" />
                </svg>
                <div>
                  <h2>The opportunity</h2>
                  <p className={styles.body}>{task.description}</p>
                </div>
              </section>

              {company && (
                <section className={styles.about}>
                  <span className={styles.logoLarge} aria-hidden="true">
                    {initials(company.name)}
                  </span>
                  <h3>About {company.name}</h3>
                  {company.website && (
                    <a
                      className={styles.website}
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Company website ↗
                    </a>
                  )}
                </section>
              )}
            </>
          ) : (
            <section className={styles.section}>
              <svg {...ICON} className={styles.sectionIcon}>
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              <div>
                <h2>Task files</h2>
                <p className={styles.body}>
                  The company shares project files with the student it selects for this task.
                </p>
              </div>
            </section>
          )}
        </div>

        <aside className={styles.aside}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <svg {...ICON}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 8h.01" />
              </svg>
              Task details
            </h2>
            <dl className={styles.facts}>
              <div>
                <dt>
                  <svg {...ICON}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  Estimated effort
                </dt>
                <dd>
                  {task.estimated_hours !== null ? formatEstimate(task.estimated_hours) : '—'}
                </dd>
              </div>
              <div>
                <dt>
                  <svg {...ICON}>
                    <path d="M6 20v-4M12 20v-9M18 20V5" />
                  </svg>
                  Difficulty
                </dt>
                <dd>
                  <Badge tone={task.difficulty === 'easy' ? 'success' : 'warning'}>
                    {DIFFICULTY_LABELS[task.difficulty] ?? task.difficulty}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt>
                  <svg {...ICON}>
                    <rect x="4" y="5" width="16" height="11" rx="1" />
                    <path d="M2 19h20" />
                  </svg>
                  Work format
                </dt>
                <dd>Remote · Project based</dd>
              </div>
              <div>
                <dt>
                  <svg {...ICON}>
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                  Private file access
                </dt>
                <dd>Available after selection</dd>
              </div>
            </dl>
          </div>

          {verified && (
            <div className={styles.card}>
              <Badge tone="success">
                <svg {...ICON} width={14} height={14} className={styles.shield}>
                  <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                Identity verified
              </Badge>
              <p className={styles.muted}>This company has verified its identity on SkillSpring.</p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
