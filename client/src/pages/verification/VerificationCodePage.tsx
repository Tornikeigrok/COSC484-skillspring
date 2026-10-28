import { useRef, useState } from 'react';
import type { ClipboardEvent, FormEvent, KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, PageHeading, buttonClass } from '../../components/ui';
import { cx } from '../../utils/cx';
import layout from '../../styles/layout.module.css';
import notice from '../../styles/notice.module.css';
import styles from './VerificationCodePage.module.css';
import { useValidateCode, useValidateCompanyCode } from './hooks';
import { useCurrentUser } from '../dashboard/hooks/use-profile';



const LENGTH = 6;

export const VerificationCodePage = () => {
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const code = digits.join('');

  function fill(start: number, value: string) {
    const chars = value.replace(/\D/g, '').slice(0, LENGTH - start).split('');
    if (!chars.length) return;
    const next = [...digits];
    chars.forEach((c, i) => (next[start + i] = c));
    setDigits(next);
    inputs.current[Math.min(start + chars.length, LENGTH - 1)]?.focus();
  }

  function onKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && i > 0) {
      inputs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowRight' && i < LENGTH - 1) {
      inputs.current[i + 1]?.focus();
    }
  }

  function onPaste(i: number, e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    fill(i, e.clipboardData.getData('text'));
  }

 
  const studentValidation = useValidateCode();
  const companyValidation = useValidateCompanyCode();
  const { data: user } = useCurrentUser();
  const student = user?.role === 'student';
  // the mutation for this user's role; everything below reads from it
  const validation = student ? studentValidation : companyValidation;

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // role unknown until the profile loads; don't guess which endpoint to hit
    if (!user) return;
    validation.mutate(code);
  }

  return (
    <div className={layout.narrowPage}>
      <PageHeading
        eyebrow="BUILDING TRUST"
        title="Check your email"
        description={`We sent a 6-digit code to your ${student ? 'university' : 'work'} email. Enter it below to finish verification.`}
      />
      {validation.isSuccess ?
      <Card className={styles.card} role="status">
        <div className={cx(styles.icon, styles.iconSuccess)} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className={styles.successTitle}>You're verified</h2>
        <p className={styles.successText}>
          {student
            ? 'Your university email is confirmed. You can now apply to tasks from companies on SkillSpring.'
            : 'Your work email is confirmed. You can now post tasks for students on SkillSpring.'}
        </p>
        <Link className={buttonClass('primary', styles.successAction)} to={student ? '/tasks' : '/business/tasks/new'}>
          {student ? 'Explore tasks' : 'Post a task'}
        </Link>
      </Card>
      :
      <Card className={styles.card}>
        <div className={styles.icon} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
        </div>
        <form
          className={styles.form}
          onSubmit={submit}
          // editing the code clears the last "wrong code" error
          onChange={() => validation.isError && validation.reset()}
          noValidate
        >
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Verification code</legend>
            <div className={styles.digits}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputs.current[i] = el;
                  }}
                  className={styles.digit}
                  value={d}
                  inputMode="numeric"
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  maxLength={1}
                  aria-label={`Digit ${i + 1}`}
                  autoFocus={i === 0}
                  onChange={(e) => {
                    if (e.target.value === '') {
                      setDigits(digits.map((x, j) => (j === i ? '' : x)));
                    } else {
                      fill(i, e.target.value.slice(-1));
                    }
                  }}
                  onKeyDown={(e) => onKeyDown(i, e)}
                  onPaste={(e) => onPaste(i, e)}
                  onFocus={(e) => e.target.select()}
                />
              ))}
            </div>
          </fieldset>
          <Button type="submit" className={styles.submit} disabled={code.length < LENGTH || validation.isPending || !user}>
            {validation.isPending ? 'Verifying code...' : 'Verify code'}
          </Button>
          {validation.isError && <p className={cx(notice.notice, notice.error)} role="alert">{validation.error.message}</p>}
          <p className={styles.resend}>
            Didn't get it? Check your spam folder or{' '}
            <button type="button" className={styles.link}>
              resend the code
            </button>
          </p>
        </form>
      </Card>
      }
    </div>
  );
};

export default VerificationCodePage;
