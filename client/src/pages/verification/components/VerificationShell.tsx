import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';
import { COPY, ICONS, STEPS } from '../constants/verification';
import { Icon } from './Icon';
import styles from '../Verification.module.css';

interface Props {
  role: 'student' | 'company';
  // index into STEPS; past steps render as done
  step: number;
  title: string;
  description: string;
  children: ReactNode;
}

export function VerificationShell({ role, step, title, description, children }: Props) {
  const copy = COPY[role];

  return (
    <div className={styles.shell}>
      <aside className={styles.side}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h1 className={styles.sideTitle}>{copy.title}</h1>
        <p className={styles.sideText}>{copy.description}</p>

        <ol className={styles.steps} aria-label="Verification steps">
          {STEPS.map((s, i) => {
            const state = i < step ? 'done' : i === step ? 'current' : 'todo';
            return (
              <li
                key={s.label}
                className={cx(styles.step, styles[state])}
                aria-current={state === 'current' ? 'step' : undefined}
              >
                <span className={styles.dot}>
                  {state !== 'todo' && <Icon d={ICONS.check} size={12} />}
                </span>
                <Icon d={s.icon} size={20} className={styles.stepIcon} />
                {s.label}
                {state === 'done' && <span className={styles.srOnly}>(done)</span>}
              </li>
            );
          })}
        </ol>

        <div className={styles.art} aria-hidden="true">
          <div className={styles.idCard}>
            <span className={styles.idBadge}>
              <Icon d={role === 'student' ? ICONS.cap : ICONS.building} size={28} />
            </span>
            <span className={styles.idLines}>
              <i />
              <i />
            </span>
            <i className={styles.idLine} />
            <i className={styles.idLineShort} />
          </div>
        </div>
      </aside>

      <section className={styles.main} aria-labelledby="verification-title">
        <header className={styles.mainHead}>
          <h2 id="verification-title">{title}</h2>
          <p>{description}</p>
        </header>
        {children}
      </section>
    </div>
  );
}
