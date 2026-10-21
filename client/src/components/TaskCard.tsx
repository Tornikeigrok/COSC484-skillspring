import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from './ui';
import { categories } from '../lib/types';
import { cx } from '../utils/cx';
import { formatEstimate, initials } from '../utils/task-display';
import styles from './TaskCard.module.css';
import type { Task } from '../lib/types';

const ICON = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

export function TaskCard({ task, manage = false }: { task: Task; manage?: boolean }) {
  const [saved, setSaved] = useState(false);
  const tint = {
    '--tint-bg': `var(--category-${task.category}-bg, var(--color-brand-soft))`,
    '--tint-fg': `var(--category-${task.category}-fg, var(--color-brand))`,
  } as CSSProperties;
  const href = manage ? `/business/tasks/${task.id}/proposals` : `/tasks/${task.id}`;
  return (
    <article className={styles.card} style={tint}>
      <div className={styles.inner}>
        <div className={styles.thumb} aria-hidden="true">
          <span className={styles.thumbTag}>{categories[task.category] ?? task.category}</span>
        </div>
        <div className={styles.body}>
          <p className={styles.company}>
            <span className={styles.logo} aria-hidden="true">
              {initials(task.company.name)}
            </span>
            {task.company.name}
            {task.company.verification_status === 'verified' && (
              <svg className={styles.verified} viewBox="0 0 24 24" role="img">
                <title>Verified company</title>
                <circle cx="12" cy="12" r="10" fill="currentColor" />
                <path d="m8 12 3 3 5-6" fill="none" stroke="#fff" strokeWidth="2.5" />
              </svg>
            )}
          </p>
          <h2 className={styles.title}>
            <Link to={href}>{task.title}</Link>
          </h2>
          <p className={styles.description}>{task.description}</p>
          <ul className={styles.skills} aria-label="Skills">
            {task.skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </div>
        <div className={styles.meta}>
          <dl className={styles.facts}>
            <div>
              <dt>
                <svg {...ICON}>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                <span className={styles.srOnly}>Estimated time</span>
              </dt>
              <dd>{formatEstimate(task.estimated_hours)}</dd>
            </div>
            <div>
              <dt>
                <svg {...ICON}>
                  <path d="M6 20v-4M12 20v-9M18 20V5" />
                </svg>
                <span className={styles.srOnly}>Difficulty</span>
              </dt>
              <dd className={styles.capitalize}>{task.difficulty}</dd>
            </div>
          </dl>
          {manage ? (
            <div className={styles.status}>
              <StatusBadge status={task.status} />
            </div>
          ) : (
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
          )}
          <Link to={href} className={styles.cta}>
            {manage ? 'Manage task' : 'View project'}
            <svg {...ICON}>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}