import { Fragment } from 'react';
import type { CSSProperties } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Field, FieldError, Textarea } from '../../components/ui';
import { Icon } from './components/Icon';
import { PATHS } from './constants/manage-task';
import { cx } from '../../utils/cx';
import layout from '../assignments/SubmitWorkPage.module.css';
import manage from './ManageTaskPage.module.css';
import styles from './ReviewStudentWork.module.css';
import { useSubmitReview } from './hooks';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitReviewSchema, submitReview } from './utils/business-tasks-validations';
import { toast } from 'sonner';




// Contribution-graph shades, lightest to strongest
const LEVELS = [
  { value: 1, name: 'Needs work', color: '#9be9a8', hint: 'Broken or missing key requirements.' },
  { value: 2, name: 'Acceptable', color: '#40c463', hint: 'Works, with clear gaps to fix.' },
  { value: 3, name: 'Solid', color: '#30a14e', hint: 'Meets the brief with minor nits.' },
  { value: 4, name: 'Exceptional', color: '#216e39', hint: 'Production ready, beyond the brief.' },
];

const CRITERIA = [
  ['functionality', 'Functionality', 'Runs as described and meets the requirements.'],
  ['code_quality', 'Code quality', 'Readable, organized, sensible conventions.'],
  ['documentation', 'Documentation', 'README and notes make setup easy.'],
  ['communication', 'Communication', 'Responsive and clear throughout.'],
] as const;

const VERIFIED = [
  'Followed the README setup steps',
  'Built and ran it locally',
  'Checked it against the task requirements',
  'Read through the main code paths',
];

const VERDICTS = [
  {
    value: 'accept',
    label: 'Approve',
    hint: 'Accept the work and mark the task complete.',
    icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 12l3 3 5-6',
    tone: styles.approve,
  },
  {
    value: 'request_changes',
    label: 'Request changes',
    hint: 'Send feedback that must be addressed first.',
    icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8v5M12 16.5v.01',
    tone: styles.changes,
  },
  {
    value: 'reject',
    label: 'Reject',
    hint: 'Decline the work. The task is not completed.',
    icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 9l6 6M15 9l-6 6',
    tone: styles.reject,
  },
];

// Mirrors the automatic scan run on upload
const CHECKS = [
  ['Archive structure', 'Valid .zip, readable entries'],
  ['Size limit', 'Under 50 MB'],
  ['Secret scan', 'No keys, tokens, or .env files'],
  ['Clean build output', 'No node_modules or .git'],
];

const CHECK_ICON = 'M20 6 9 17l-5-5';

export default function ReviewStudentWork() {
  const { taskId } = useParams();
  const back = `/business/tasks/${taskId}/proposals`;

  const url = new URLSearchParams(window.location.search);

  const navigate = useNavigate();
  const { mutate: submitFeedback, isPending } = useSubmitReview(url.get('submission') ?? undefined);
  // zod every input before submitting
  const { register, handleSubmit, formState: { errors }} = useForm({
    resolver: zodResolver(submitReview),
  });

  const submit = (data: SubmitReviewSchema) => {
    submitFeedback({
      submissionId: url.get('submission'),
      verdict: data.verdict,
      feedback: data.feedback,
      functionality: data.functionality,
      quality: data.code_quality,
      documentation: data.documentation,
      communication: data.communication
    }, { onSuccess: () => {
      toast.success('Thanks, your review was sent to the student');
      navigate(back, { replace: true });
    }});
  }

 
  return (
    <div className={layout.page}>
      <Link className={layout.back} to={back}>
        <Icon d="M19 12H5M11 6l-6 6 6 6" className={layout.icon} />
        Back to task
      </Link>

      <header className={layout.header}>
        <h1 className={layout.title}>Review submission</h1>
        <p className={layout.subtitle}>
          Score each area, note what you verified, then approve or request changes.
        </p>
      </header>

      <div className={layout.grid}>
        <form className={layout.card} onSubmit={handleSubmit(submit)}>
          <div className={styles.student}>
            <span className={cx(manage.avatar, manage.avatarLg)} aria-hidden="true">
              ST
            </span>
            <div className={manage.detailWho}>
              <h3>Student name</h3>
              <p>Submitted —</p>
            </div>
          </div>

          <div className={manage.file}>
            <Icon d={PATHS.file} />
            <div className={manage.fileInfo}>
              <strong>T-{taskId}-submission.zip</strong>
              <small>Passed automatic checks · ZIP archive</small>
            </div>
          </div>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>Scorecard</legend>
            {CRITERIA.map(([key, label, hint]) => (
              <div key={key} className={styles.criterion}>
                <div className={styles.criterionText}>
                  <strong>{label}</strong>
                  <span>{hint}</span>
                  <FieldError id={`${key}-error`} message={errors[key]?.message} />
                </div>
                <div className={styles.meter}>
                  <span className={styles.levelName} aria-hidden="true">
                    <span className={styles.unrated}>Not rated</span>
                    {LEVELS.map((l) => (
                      <span key={l.value} className={styles[`name${l.value}`]}>
                        {l.name}
                      </span>
                    ))}
                  </span>
                  {/* DOM runs 4→1 and displays reversed, so `:checked ~ .cell` fills every lower level */}
                  <div
                    className={styles.cells}
                    role="radiogroup"
                    aria-label={label}
                    aria-invalid={!!errors[key]}
                    aria-describedby={errors[key] ? `${key}-error` : undefined}
                  >
                    {[...LEVELS].reverse().map((l) => (
                      <Fragment key={l.value}>
                        <input
                          {...register(key)}
                          type="radio"
                          id={`${key}-${l.value}`}
                          value={l.value}
                          className={styles.cellInput}
                        />
                        <label
                          htmlFor={`${key}-${l.value}`}
                          className={styles.cell}
                          style={{ '--level': l.color } as CSSProperties}
                          title={l.name}
                        >
                          <span className={styles.square} />
                          <span className={styles.srOnly}>{l.name}</span>
                        </label>
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>What you verified</legend>
            <ul className={styles.tasks}>
              {VERIFIED.map((item, i) => (
                <li key={item}>
                  <label className={styles.task}>
                    <input type="checkbox" name="verified" value={i} />
                    {item}
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          <Field label="Feedback for the student" id="feedback" error={errors.feedback?.message}>
            <Textarea
              {...register('feedback')}
              id="feedback"
              aria-invalid={!!errors.feedback}
              aria-describedby={errors.feedback ? 'feedback-error' : undefined}
              rows={5}
              className={layout.notes}
              placeholder="What worked well, what should change, and why. Reference files or lines where you can."
            />
          </Field>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>Verdict</legend>
            <div className={styles.verdicts}>
              {VERDICTS.map((v) => (
                <label key={v.value} className={cx(styles.verdict, v.tone)}>
                  <input {...register('verdict')} type="radio" value={v.value} />
                  <Icon d={v.icon} className={styles.verdictIcon} />
                  <span>
                    <strong>{v.label}</strong>
                    <small>{v.hint}</small>
                  </span>
                </label>
              ))}
            </div>
            <FieldError id="verdict-error" message={errors.verdict?.message} />
          </fieldset>

          <div className={layout.footer}>
            <Link className={layout.cancel} to={back}>
              Cancel
            </Link>
            <Button type="submit" variant="dark" className={layout.submit} disabled={isPending}>
              {isPending ? 'Submitting…' : 'Submit review'}
            </Button>
          </div>
        </form>

        <aside className={layout.side}>
          <section className={cx(layout.panel, styles.checksPanel)}>
            <div className={styles.panelHead}>
              <h2 className={layout.panelTitle}>Automated checks</h2>
              <Badge tone="success">
                {CHECKS.length}/{CHECKS.length} passed
              </Badge>
            </div>
            <ul className={styles.checks}>
              {CHECKS.map(([name, detail]) => (
                <li key={name}>
                  <span className={styles.checkDot}>
                    <Icon d={CHECK_ICON} />
                  </span>
                  <span className={styles.checkText}>
                    <strong>{name}</strong>
                    <small>{detail}</small>
                  </span>
                </li>
              ))}
            </ul>
            <p className={styles.checksNote}>
              Checks cover the archive only. Run the code to judge how it works.
            </p>
          </section>

          <section className={layout.panel}>
            <h2 className={layout.panelTitle}>Scoring guide</h2>
            <ul className={styles.guide}>
              {LEVELS.map((l) => (
                <li key={l.value}>
                  <span className={styles.guideCells} aria-hidden="true">
                    {LEVELS.map((c) => (
                      <span
                        key={c.value}
                        className={styles.square}
                        style={c.value <= l.value ? { backgroundColor: c.color } : undefined}
                      />
                    ))}
                  </span>
                  <span className={styles.checkText}>
                    <strong>{l.name}</strong>
                    <small>{l.hint}</small>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
