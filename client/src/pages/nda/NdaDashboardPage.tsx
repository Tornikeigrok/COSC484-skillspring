import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-request';
import { cx } from '@/utils/cx';
import { Button, EmptyState, Field, Input, Loading, buttonClass } from '../../components/ui';
import notice from '../../styles/notice.module.css';
import { useMyProposals } from '../proposal/hooks';
import { Icon } from '../verification/components/Icon';
import shell from '../verification/Verification.module.css';
import styles from './NdaDashboardPage.module.css';

const ICONS = {
  check: 'M20 6 9 17l-5-5',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  badge: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 12l3 3 5-6',
  pen: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  rocket: 'M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M9 15l-3-3c1-4 5-9 12-9 0 7-5 11-9 12zM15 9h.01',
  shield: 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z',
  building: 'M4 21V5l8-2v18M12 8h8v13M8 9h.01M8 13h.01M8 17h.01M16 12h.01M16 16h.01M2 21h20',
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
};

const STEPS = [
  { label: 'Proposal accepted', icon: ICONS.badge },
  { label: 'Sign the NDA', icon: ICONS.pen },
  { label: 'Start assignment', icon: ICONS.rocket },
];

// ponytail: summary copy only; swap for the company's real NDA text once the API returns it
const TERMS = [
  {
    title: 'Confidential information',
    body: 'Anything the company shares with you for this task, including code, data, designs, documents and business plans, is confidential.',
  },
  {
    title: 'How you can use it',
    body: 'Use confidential information only to complete this task. Don’t share it, publish it, or use it for anything else.',
  },
  {
    title: 'Your work',
    body: 'Work you create for this task belongs to the company once it’s delivered. You can describe it in your portfolio without revealing confidential details.',
  },
  {
    title: 'After the task',
    body: 'When the task ends, delete or return any confidential material. Your duty to keep it private continues after the task is done.',
  },
];

function useSignNda() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { taskId: number; fullName: string }) =>
      apiRequest('/api/student/sign-nda', 'POST', body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-proposals-student'] }),
  });
}

export default function NdaDashboardPage() {
  const taskId = Number(useParams().taskId);
  const { data: proposals, isPending } = useMyProposals();
  const sign = useSignNda();
  const [agreed, setAgreed] = useState(false);
  const [fullName, setFullName] = useState('');
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
    if (fullName.trim().length < 2) return setError('Type your full name to sign.');
    setError('');
    sign.mutate({ taskId, fullName: fullName.trim() });
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
            <span className={styles.docSign}>{signed ? fullName || 'Signed' : ''}</span>
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

              <Field label="Full name" id="signature" hint="Typing your name acts as your signature.">
                <div className={shell.withIcon}>
                  <Icon d={ICONS.pen} className={shell.fieldIcon} />
                  <Input
                    id="signature"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setError('');
                    }}
                    placeholder="Jane Doe"
                    autoComplete="name"
                    className={styles.signature}
                  />
                </div>
              </Field>

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
