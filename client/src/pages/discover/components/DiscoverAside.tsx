import { Link } from 'react-router-dom';
import { useFetchProfile, type StudentProfile } from '@/pages/home/hooks/use-profile';
import { DIFFICULTY_LABELS } from '@/constants/tasks';
import { cx } from '@/utils/cx';
import {
  ASIDE_ID,
  COMPANY_AVATARS,
  ICONS,
  PROGRESS_STEPS,
  RECOMMENDED_COUNT,
  tint,
} from '../constants/discover';
import type { AvailableTask } from '../hooks';
import { recommendTasks } from '../utils/filter-tasks';
import { CompanyLogo } from './CompanyLogo';
import { Svg } from './Svg';
import styles from '../DiscoverPage.module.css';

export function DiscoverAside({ tasks }: { tasks: AvailableTask[] }) {
  const { data: profile } = useFetchProfile();
  const student = profile?.Student;
  const recommended = recommendTasks(tasks, student?.skills ?? [], RECOMMENDED_COUNT);
  const companies = [
    ...new Set(
      tasks.filter((t) => t.Company.verification_status === 'verified').map((t) => t.Company.name),
    ),
  ];

  return (
    <aside id={ASIDE_ID} className={styles.aside} aria-label="Your progress and recommendations">
      {student && <Progress student={student} />}

      {recommended.length > 0 && (
        <section className={styles.panel} aria-labelledby="recommended-title">
          <header className={styles.panelHead}>
            <Svg d={ICONS.sparkle} size={22} className={styles.panelIcon} />
            <div>
              <h2 id="recommended-title">Recommended for you</h2>
              <p>Tasks that match your skills and interests.</p>
            </div>
          </header>
          <ul className={styles.recList}>
            {recommended.map((task) => (
              <li key={task.id}>
                <Link to={`/tasks/${task.id}`} className={styles.rec}>
                  <CompanyLogo
                    name={task.Company.name}
                    className={styles.logoSm}
                    style={tint(task.task_type)}
                  />
                  <span className={styles.recText}>
                    <strong>{task.title}</strong>
                    <small>
                      {task.Company.name} · {DIFFICULTY_LABELS[task.difficulty]}
                    </small>
                  </span>
                  <Svg d={ICONS.chevron} size={16} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {companies.length > 0 && (
        <section className={styles.panel} aria-labelledby="companies-title">
          <header className={styles.panelHead}>
            <Svg d={ICONS.shield} size={22} className={styles.panelIcon} />
            <div>
              <h2 id="companies-title">Verified companies</h2>
              <p>Work with real companies and build verifiable experience.</p>
            </div>
          </header>
          <ul className={styles.avatars}>
            {companies.slice(0, COMPANY_AVATARS).map((name) => (
              <li key={name} title={name}>
                <CompanyLogo name={name} className={styles.avatar} />
              </li>
            ))}
            {companies.length > COMPANY_AVATARS && (
              <li className={styles.more}>+{companies.length - COMPANY_AVATARS}</li>
            )}
          </ul>
        </section>
      )}
    </aside>
  );
}

function Progress({ student }: { student: StudentProfile['Student'] }) {
  const steps = PROGRESS_STEPS.map((step) => ({ ...step, isDone: step.done(student) }));
  const done = steps.filter((s) => s.isDone).length;

  return (
    <section className={styles.progress} aria-labelledby="progress-title">
      <header className={styles.progressHead}>
        <h2 id="progress-title">Your progress</h2>
        <span>
          {done} / {steps.length}
        </span>
      </header>
      <div
        className={styles.progressBar}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={steps.length}
        aria-valuenow={done}
        aria-label="Profile completion"
      >
        <span style={{ width: `${(done / steps.length) * 100}%` }} />
      </div>
      <ul className={styles.steps}>
        {steps.map((step) => (
          <li key={step.label}>
            <Link to={step.to} className={cx(styles.step, step.isDone && styles.stepDone)}>
              <span className={styles.stepDot}>
                {step.isDone && <Svg d={ICONS.check} size={12} />}
              </span>
              {step.label}
              <span className={styles.srOnly}>{step.isDone ? '(done)' : '(to do)'}</span>
              <Svg d={ICONS.chevron} size={16} className={styles.stepArrow} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
