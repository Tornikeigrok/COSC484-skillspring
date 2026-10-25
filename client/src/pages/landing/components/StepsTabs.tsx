import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { cx } from '../../../utils/cx';
import { COMPANY_STEPS, STUDENT_STEPS } from '../constants/audience-steps';
import styles from '../LandingPage.module.css';

const TABS = [
  {
    id: 'student',
    label: 'For students',
    steps: STUDENT_STEPS,
  },
  {
    id: 'company',
    label: 'For companies',
    steps: COMPANY_STEPS,
  },
] as const;

export function StepsTabs() {
  const [active, setActive] = useState<(typeof TABS)[number]['id']>('student');
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const tab = TABS.find((t) => t.id === active) ?? TABS[0];

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
        next = (index + 1) % TABS.length;
        break;
      case 'ArrowLeft':
        next = (index + TABS.length - 1) % TABS.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = TABS.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    setActive(TABS[next].id);
    buttons.current[next]?.focus();
  }

  return (
    <div className={styles.tabs}>
      <div className={styles.tabList} role="tablist" aria-label="Choose your role">
        {TABS.map((t, index) => (
          <button
            key={t.id}
            ref={(element) => {
              buttons.current[index] = element;
            }}
            role="tab"
            type="button"
            id={`tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls="steps-panel"
            tabIndex={active === t.id ? 0 : -1}
            className={cx(styles.tabButton, active === t.id && styles.tabActive)}
            onClick={() => setActive(t.id)}
            onKeyDown={(event) => moveFocus(event, index)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div id="steps-panel" role="tabpanel" aria-labelledby={`tab-${tab.id}`} tabIndex={0}>
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
      </div>
    </div>
  );
}
