import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cx } from '@/utils/cx';
import { Button, EmptyState, Field, Input, Loading, buttonClass } from '../../components/ui';
import notice from '../../styles/notice.module.css';
import { useMyProposals } from '../proposal/hooks';
import { Icon } from '../verification/components/Icon';
import shell from '../verification/Verification.module.css';
import styles from './NdaDashboardPage.module.css';
import { useSignNda } from './hooks/use-nda';
import { ICONS, STEPS, TERMS } from './constants/nda';

export default function NdaDashboardPage() {
  const taskId = Number(useParams().taskId);
  const { data: proposals, isPending } = useMyProposals();
  const sign = useSignNda(taskId);
  const [agreed, setAgreed] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  if (isPending) return <Loading />;

  const proposal = proposals?.find((p) => p.Task.id === taskId && p.status === 'accepted');
  if (!proposal) {
    return (
      <EmptyState title="No NDA to sign here.">
        This link doesn’t match one of your accepted proposals. Check the link in your email, or{' '}
        <Link to="/student/proposals">view your proposals</Link>.
      </EmptyState>
    );
  }

  const { Task: task } = proposal;
  const company = task.Company?.name ?? 'The company';
  const signed = proposal.nda_signed || sign.isSuccess;
  const step = signed ? 2 : 1;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!agreed) return setError('Please confirm you’ve read and agree to the NDA.');
    if (!firstName.trim() || !lastName.trim()) return setError('Type your first and last name to sign.');
    setError('');
    sign.mutate({ firstName: firstName.trim(), lastName: lastName.trim() });
  }

  return (
    <div className={shell.shell}>
      <aside className={shell.side}>
        <p className={shell.eyebrow}>Non-disclosure agreement</p>
        <h1 className={shell.sideTitle}>One step before you start</h1>
        <p className={shell.sideText}>
          {company} asks every student to sign an NDA before work begins. It protects their
          information and makes the expectations clear for both sides.
        </p>

        <ol className={shell.steps} aria-label="Assignment steps">
          {STEPS.map((s, i) => {
            const state = i < step ? 'done' : i === step ? 'current' : 'todo';
            return (
              <li
                key={s.label}
                className={cx(shell.step, shell[state])}
                aria-current={state === 'current' ? 'step' : undefined}
              >
                <span className={shell.dot}>
                  {state !== 'todo' && <Icon d={ICONS.check} size={12} />}
                </span>
                <Icon d={s.icon} size={20} className={shell.stepIcon} />
                {s.label}
                {state === 'done' && <span className={shell.srOnly}>(done)</span>}
              </li>
            );
          })}
        </ol>

        <div className={shell.art} aria-hidden="true">
          <div className={styles.doc}>
            <span className={styles.docBadge}>
              <Icon d={signed ? ICONS.check : ICONS.shield} size={26} />
            </span>
            <i />
            <i />
            <i className={styles.short} />
            <span className={styles.docSign}>{signed ? `${firstName} ${lastName}`.trim() || 'Signed' : ''}</span>
          </div>
        </div>
      </aside>

      <section className={shell.main} aria-labelledby="nda-title">
        <div className={styles.task}>
          <span className={styles.taskIcon}>
            <Icon d={ICONS.building} size={20} />
          </span>
          <div>
            <p className={styles.taskTitle}>{task.title}</p>
            <p className={styles.taskMeta}>
              {company} · #T-{task.id}
            </p>
          </div>
        </div>

        {signed ? (
          <div className={styles.done}>
            <span className={styles.doneIcon}>
              <Icon d={ICONS.check} size={28} />
            </span>
            <h2 id="nda-title">You’re all set</h2>
            <p>
              Your NDA with {company} is signed. You can start the assignment whenever you’re ready.
            </p>
            <Link to="/assignments" className={buttonClass('primary')}>
              Start assignment
              <Icon d={ICONS.arrow} size={16} />
            </Link>
          </div>
        ) : (
          <>
            <header className={shell.mainHead}>
              <h2 id="nda-title">Review and sign</h2>
              <p>Read the key terms below, then sign with your full name.</p>
            </header>

            <div className={styles.terms} tabIndex={0} aria-label="NDA terms">
              {TERMS.map((t, i) => (
                <section key={t.title} className={styles.term}>
                  <span className={styles.termNum}>{i + 1}</span>
                  <div>
                    <h3>{t.title}</h3>
                    <p>{t.body}</p>
                  </div>
                </section>
              ))}
            </div>

            <form className={shell.form} onSubmit={submit} noValidate>
              <label className={styles.agree}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    setError('');
                  }}
                />
                <span>
                  I’ve read the NDA and agree to keep {company}’s information confidential.
                </span>
              </label>

              <div className={styles.nameRow}>
                <Field label="First name" id="first-name">
                  <div className={shell.withIcon}>
                    <Icon d={ICONS.pen} className={shell.fieldIcon} />
                    <Input
                      id="first-name"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        setError('');
                      }}
                      placeholder="Jane"
                      autoComplete="given-name"
                      className={styles.signature}
                    />
                  </div>
                </Field>
                <Field label="Last name" id="last-name">
                  <Input
                    id="last-name"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      setError('');
                    }}
                    placeholder="Doe"
                    autoComplete="family-name"
                    className={styles.signature}
                  />
                </Field>
              </div>
              <p className={styles.signHint}>Typing your name acts as your signature.</p>

              {(error || sign.isError) && (
                <p className={cx(notice.notice, notice.error)} role="alert">
                  {error || sign.error?.message}
                </p>
              )}

              <div className={shell.actions}>
                <Button type="submit" busy={sign.isPending}>
                  <Icon d={ICONS.lock} size={16} />
                  Sign NDA
                </Button>
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
