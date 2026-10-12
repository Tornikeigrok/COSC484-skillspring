import { Link, NavLink, useParams } from 'react-router-dom';
import { fullName } from '../../lib/types';
import { Card, DateLabel, PageHeading, StatusBadge, buttonClass } from '../../components/ui';
import { useFetchProfile } from '../dashboard/hooks/use-profile';
import { cx } from '../../utils/cx';
import layout from '../../styles/layout.module.css';
import links from '../../styles/links.module.css';
import notice from '../../styles/notice.module.css';
import text from '../../styles/text.module.css';
import { AgreementPanel } from './components/AgreementPanel';
import { ReviewPanel } from './components/ReviewPanel';
import { SubmitPanel } from './components/SubmitPanel';
import { ValidationPanel } from './components/ValidationPanel';
import { sampleAssignmentDetail } from './constants/sample-assignments';
import { SUBMITTABLE_STATUSES } from './constants/assignment-statuses';
import { PROGRESS_STEPS } from './constants/progress-steps';
import { BUSINESS_TAB, COMMON_TABS, STUDENT_TAB } from './constants/tabs';
import { formatKb } from './utils/format-kb';
import { isProgressStepDone } from './utils/is-progress-step-done';
import styles from './AssignmentPage.module.css';

export default function AssignmentPage({
  view = 'overview',
}: {
  view?: 'overview' | 'agreement' | 'submit' | 'review' | 'validation';
}) {
  const { id } = useParams();
  const { data: user } = useFetchProfile();
  const detail = sampleAssignmentDetail;
  const { assignment, agreement } = detail;
  const student = user?.role === 'student';
  const tabs = [...COMMON_TABS, student ? STUDENT_TAB : BUSINESS_TAB];
  return (
    <>
      <Link className={links.backLink} to="/assignments">
        ← Assignments
      </Link>
      <PageHeading
        eyebrow={assignment.task.company.name}
        title={assignment.task.title}
        description={`Student: ${fullName(assignment.student)}`}
        action={<StatusBadge status={assignment.status} />}
      />
      <nav className={styles.tabs} aria-label="Assignment sections">
        {tabs.map(([suffix, label]) => (
          <NavLink
            key={suffix}
            end
            to={`/assignments/${id}${suffix}`}
            className={({ isActive }) =>
              cx(styles.tab, isActive ? styles.tabActive : styles.tabIdle)
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      {view === 'agreement' ? (
        <AgreementPanel agreement={agreement} canAccept={student} />
      ) : view === 'submit' ? (
        student ? (
          <SubmitPanel assignment={assignment} />
        ) : (
          <p className={cx(notice.notice, notice.info)}>
            Only the selected student can submit work.
          </p>
        )
      ) : view === 'review' ? (
        !student ? (
          <ReviewPanel detail={detail} />
        ) : (
          <p className={cx(notice.notice, notice.info)}>
            Only the business owner can review submissions.
          </p>
        )
      ) : view === 'validation' ? (
        <ValidationPanel detail={detail} />
      ) : (
        <>
          <div className={styles.progress} aria-label="Assignment progress">
            {PROGRESS_STEPS.map((step, index) => (
              <div
                key={step}
                className={isProgressStepDone(index, detail) ? styles.progressDone : undefined}
              >
                <span>{index + 1}</span>
                {step}
              </div>
            ))}
          </div>
          {assignment.status === 'awaiting_agreement' && (
            <div className={cx(notice.notice, notice.info, notice.withAction)}>
              <p>Private files are locked until the student accepts the access agreement.</p>
              <Link className={buttonClass()} to={`/assignments/${id}/agreement`}>
                View agreement →
              </Link>
            </div>
          )}
          {assignment.status === 'completed' && (
            <div className={cx(notice.notice, notice.success, notice.withAction)}>
              <p>Work approved. Verified experience has been added to the student profile.</p>
              <Link className={buttonClass('secondary')} to={`/profiles/${assignment.student.id}`}>
                View experience →
              </Link>
            </div>
          )}
          {assignment.status === 'rejected' && (
            <p className={cx(notice.notice, notice.error)}>
              This assignment was closed without verified experience. Read the business feedback
              below.
            </p>
          )}
          <div className={layout.split}>
            <div className={layout.stack}>
              <Card>
                <h2>Definition of done</h2>
                <p className={text.longText}>{assignment.task.acceptance_criteria}</p>
                <Link className={links.textLink} to={`/tasks/${assignment.task.id}`}>
                  View full task →
                </Link>
              </Card>
              <Card>
                <div className={layout.headerRow}>
                  <h2>Submission history</h2>
                  {student && SUBMITTABLE_STATUSES.includes(assignment.status) && (
                    <Link className={buttonClass()} to={`/assignments/${id}/submit`}>
                      Submit work →
                    </Link>
                  )}
                  {!student && assignment.status === 'submitted' && (
                    <Link className={buttonClass()} to={`/assignments/${id}/review`}>
                      Review work →
                    </Link>
                  )}
                </div>
                {detail.submissions.length ? (
                  detail.submissions.map((submission) => {
                    const run = detail.validations.find((v) => v.submission === submission.id);
                    const review = detail.reviews.find((r) => r.submission === submission.id);
                    return (
                      <article className={styles.submission} key={submission.id}>
                        <div className={layout.headerRow}>
                          <h3>Version {submission.version}</h3>
                          {run && <StatusBadge status={run.status} />}
                        </div>
                        <p className={text.mutedSmall}>
                          <DateLabel value={submission.createdAt} />
                        </p>
                        <p className={text.longText}>{submission.notes || 'No notes added.'}</p>
                        {run?.status === 'passed' && (
                          <a className={links.textLink} href="#">
                            Download {submission.file.filename} ↓
                          </a>
                        )}
                        {review && (
                          <div className={styles.review}>
                            <StatusBadge status={review.decision} />
                            <p className={text.longText}>{review.feedback}</p>
                            {review.rating && <p>Rating: {review.rating} / 5</p>}
                          </div>
                        )}
                      </article>
                    );
                  })
                ) : (
                  <p className={text.muted}>
                    No submissions yet. Download the starter files and begin your work.
                  </p>
                )}
              </Card>
            </div>
            <aside className={layout.stack}>
              <Card>
                <h2>Project downloads</h2>
                {detail.files.length ? (
                  detail.files.map((file) => (
                    <a className={links.fileLink} key={file.id} href="#">
                      <span>
                        {file.filename}
                        <small>{formatKb(file.size)} KB</small>
                      </span>
                      ↓
                    </a>
                  ))
                ) : (
                  <p className={text.muted}>
                    {assignment.status === 'awaiting_agreement'
                      ? 'Accept the agreement to see private files.'
                      : 'No starter files were provided. Follow the task description.'}
                  </p>
                )}
              </Card>
              <Card className={layout.infoCard}>
                <h3>From work to proof</h3>
                <p className={text.mutedSmall}>
                  Your submitted archive is checked before business review. Business approval is
                  what creates verified experience.
                </p>
                <Link className={links.textLink} to={`/assignments/${id}/validation`}>
                  View validation details →
                </Link>
              </Card>
            </aside>
          </div>
        </>
      )}
    </>
  );
}
