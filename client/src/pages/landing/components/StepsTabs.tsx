import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, m } from 'motion/react';
import { buttonClass } from '../../../components/ui';
import { cx } from '../../../utils/cx';
import { COMPANY_STEPS, STUDENT_STEPS } from '../constants/audience-steps';
import styles from '../LandingPage.module.css';

const TABS = [
  {
    id: 'student',
    label: 'For students',
    steps: STUDENT_STEPS,
    cta: 'Join as a student',
    to: '/register?role=student',
  },
  {
    id: 'company',
    label: 'For companies',
    steps: COMPANY_STEPS,
    cta: 'Post your first task',
    to: '/register?role=company',
  },
] as const;

export function StepsTabs() {
  const [active, setActive] = useState<(typeof TABS)[number]['id']>('student');
  const tab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <div className={styles.tabs}>
      <div className={styles.tabList} role="tablist" aria-label="Choose your role">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            id={`tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls="steps-panel"
            className={cx(styles.tabButton, active === t.id && styles.tabActive)}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div id="steps-panel" role="tabpanel" aria-labelledby={`tab-${tab.id}`}>
        <AnimatePresence mode="wait" initial={false}>
          <m.ol
            key={tab.id}
            className={styles.timeline}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {tab.steps.map(([title, description]) => (
              <li key={title}>
                <strong>{title}</strong>
                <span>{description}</span>
              </li>
            ))}
          </m.ol>
        </AnimatePresence>
        <Link className={buttonClass('primary', styles.btn)} to={tab.to}>
          {tab.cta}
        </Link>
      </div>
    </div>
  );
}
