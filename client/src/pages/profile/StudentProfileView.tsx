import { useNavigate } from 'react-router-dom';
import { Card, buttonClass } from '../../components/ui';
import { initials } from '../../utils/task-display';
import type { ViewedStudent } from './hooks';
import { ReviewedTasks } from './ReviewedTasks';
import styles from './StudentProfileView.module.css';

const ICON = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

const CapIcon = () => (
  <svg {...ICON}>
    <path d="M22 10 12 5 2 10l10 5 10-5Z" />
    <path d="M6 12v5c3 2 9 2 12 0v-5" />
  </svg>
);

const CalendarIcon = () => (
  <svg {...ICON}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 11h18" />
  </svg>
);

export function StudentProfileView({ student }: { student: NonNullable<ViewedStudent> }) {
  const navigate = useNavigate();
  const name = `${student.User.first_name} ${student.User.last_name}`;
  const verified = student.verification_status === 'verified';
  const year = student.graduation_year && `Class of ${student.graduation_year}`;
  const skills = student.skills ?? [];
  const reviews = (student.Submissions ?? []).flatMap((s) => (s.Review ? [{ ...s, Review: s.Review }] : []));

  const facts = (
    <>
      {student.university && (
        <span className={styles.fact}>
          <CapIcon />
          {student.university}
        </span>
      )}
      {year && (
        <span className={styles.fact}>
          <CalendarIcon />
          {year}
        </span>
      )}
    </>
  );

  return (
    <div className={styles.page}>
      <button type="button" className={styles.back} onClick={() => navigate(-1)}>
        <svg {...ICON} width={14} height={14}>
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
        Back to search
      </button>

      <header className={styles.header}>
        <div className={styles.avatarLarge}>{initials(name)}</div>
        <div className={styles.identity}>
          <div className={styles.titleRow}>
            <h1>{name}</h1>
            {verified && (
              <span className={styles.verifiedPill}>
                <svg viewBox="0 0 24 24" width={14} height={14} aria-hidden="true">
                  <circle cx="12" cy="12" r="10" fill="currentColor" />
                  <path d="m8 12 3 3 5-6" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Identity verified
              </span>
            )}
          </div>
          <p className={styles.subtitle}>
            {student.university && (
              <>
                <CapIcon />
                {student.university}
              </>
            )}
            {student.university && year && <span aria-hidden="true">•</span>}
            {year}
          </p>
        </div>
        <div className={styles.actions}>
          {/* ponytail: no messaging feature yet, wire onClick when it exists */}
          <button type="button" className={buttonClass('dark')}>
            <svg {...ICON}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
            </svg>
            Send Message
          </button>
          {student.github_url && (
            <a className={buttonClass('secondary')} href={student.github_url} target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden="true">
                <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.5 9.5 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.7-4.57 4.94.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
              </svg>
              View GitHub
            </a>
          )}
        </div>
      </header>

      <div className={styles.split}>
        <div className={styles.main}>
          <Card>
            <h2 className={styles.cardTitle}>About</h2>
            <p className={styles.bio}>{student.bio || 'This student hasn’t written an introduction yet.'}</p>
            <div className={styles.factRow}>{facts}</div>
          </Card>

          <ReviewedTasks reviews={reviews} forCompany />
        </div>

        <aside>
          <Card className={styles.side}>
            <div className={styles.avatar}>{initials(name)}</div>
            <h2>{name}</h2>
            <p className={styles.role}>Student Contributor</p>
            <hr />
            <div className={styles.factList}>{facts}</div>
            {!!skills.length && (
              <>
                <hr />
                <h3 className={styles.skillsTitle}>Skills</h3>
                <div className={styles.chips}>
                  {skills.map((skill) => (
                    <span key={skill} className={styles.chip}>
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            )}
            {verified && (
              <div className={styles.verifiedBox}>
                <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden="true">
                  <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" fill="currentColor" />
                  <path d="m8.5 12 2.5 2.5 4.5-5" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <strong>Verified Profile</strong>
                  <p>This student’s identity has been verified by SkillSpring.</p>
                </div>
              </div>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
