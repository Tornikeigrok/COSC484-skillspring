import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as Menu from '@radix-ui/react-dropdown-menu';
import { toast } from 'sonner';
import { fullName } from '../../lib/types';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DateLabel,
  EmptyState,
  ErrorMessage,
  StatusBadge,
  buttonClass,
} from '../../components/ui';
import { STATUS_LABELS } from '../../constants/status';
import { DIFFICULTY_LABELS, TASK_TYPE_LABELS } from '../../constants/tasks';
import menu from '@/ui/radix-dropdown.module.css';
import { statusTone } from './constants/posted-tasks';
import { PATHS, TABS } from './constants/manage-task';
import type { Tab } from './constants/manage-task';
import { formatDateTime } from './utils/format-date-time';
import { cx } from '../../utils/cx';
import { formatEstimate, initials } from '../../utils/task-display';
import text from '../../styles/text.module.css';
import links from '../../styles/links.module.css';
import tasks from './BusinessTasksPage.module.css';
import { Empty } from './components/Empty';
import { Icon } from './components/Icon';
import styles from './ManageTaskPage.module.css';
import { useFetchAllTasks, useTaskDetails, useGetTaskProposals, useSendNda } from './hooks';
import { useDownloadSubmission, useSubmissionsForTask } from '../assignments/hooks';
import type { TaskSubmission } from '../assignments/hooks';
import { LEVELS, REVIEW_SCORES, VERDICT_DISPLAY } from './constants/review';
import review from './ReviewStudentWork.module.css';

export default function ManageTaskPage() {
  const { id } = useParams();
  const [openModal, setOpenModal] = useState(false);
  
  const { data: allTasks, isPending, isError, error, refetch } = useFetchAllTasks();
  const { data: details, isPending: assetPending } = useTaskDetails(id);
  const [tab, setTab] = useState<Tab>('proposals');
  const [closeOpen, setCloseOpen] = useState(false);
  const task = allTasks?.find((t) => String(t.id) === id);
  const asset = details?.task_assets?.TaskAsset;

  const { data: proposals = [] } = useGetTaskProposals(id, tab !== 'submission');
  const [activeId, setActiveId] = useState<number>();
  const active = proposals.find((p) => p.id === activeId) ?? proposals[0];
  const nameOf = (p: (typeof proposals)[number]) =>
    p.Student?.User ? fullName(p.Student.User) : `Student #${p.student_id}`;
  // The accepted proposal is this task's assignment
  const assigned = proposals.find((p) => p.status === 'accepted');
  const studentSelected = !!assigned;

  const { mutate: sendNda, isPending: sendingNda } = useSendNda();

  // Only an assigned student who signed the NDA can submit, so skip the request before that
  const submissionsQuery = useSubmissionsForTask(
    Number(id),
    tab === 'submission' || tab === 'review' || !!assigned?.nda_signed,
  );
  const submissions = submissionsQuery.data ?? [];
  const latest = submissions[0];
  // Newest first, same order as submissions
  const reviewed = submissions.filter((s) => s.Review);
  const latestReview = reviewed[0]?.Review;
  const download = useDownloadSubmission();

  const reviewActivity = (r: NonNullable<TaskSubmission['Review']>) => (
    <li>
      <strong>{VERDICT_DISPLAY[r.status].activity}</strong>
      <small>You reviewed the work · {formatDateTime(r.reviewed_at)}</small>
    </li>
  );

  const publicUrl = `/tasks/${id}`;

  const copyLink = () =>
    navigator.clipboard
      .writeText(`${window.location.origin}${publicUrl}`)
      .then(() => toast.success('Task link copied'))
      .catch(() => toast.error("Couldn't copy the link"));

  if (isPending) {
    return (
      <div className={tasks.loading} role="status" aria-label="Loading task">
        <div className={tasks.skeleton} />
      </div>
    );
  }
  if (isError) return <ErrorMessage error={error} retry={() => refetch()} />;
  if (!task) {
    return (
      <EmptyState
        title="Task not found"
        action={
          <Link className={buttonClass()} to="/business/tasks">
            Back to tasks
          </Link>
        }
      >
        This task doesn't exist or isn't yours.
      </EmptyState>
    );
  }

  const isOpen = task.status === 'open';
  const facts = [
    [PATHS.code, TASK_TYPE_LABELS[task.task_type]?.label ?? task.task_type, 'Type'],
    [PATHS.layers, DIFFICULTY_LABELS[task.difficulty] ?? task.difficulty, 'Difficulty'],
    [PATHS.clock, task.estimated_hours !== null ? formatEstimate(task.estimated_hours) : '—', 'Estimate'],
    [PATHS.calendar, task.deadline ? <DateLabel key="due" value={task.deadline} /> : '—', 'Deadline'],
    [PATHS.calendar, <DateLabel key="posted" value={task.created_at} />, 'Posted'],
  ] as const;

  return (
    <>
      <nav className={tasks.breadcrumb} aria-label="Breadcrumb">
        <Link to="/business/tasks">Tasks</Link>
        <span aria-hidden="true">›</span>
        <span className={tasks.breadcrumbCurrent} aria-current="page">
          T-{task.id}
        </span>
      </nav>

      <div className={styles.layout}>
        <div className={styles.main}>
          <header className={styles.header}>
            <span className={tasks.id}>T-{task.id}</span>
            <h1>{task.title}</h1>
            <span className={cx(tasks.status, statusTone(task.status), styles.pill)}>
              {STATUS_LABELS[task.status] ?? task.status}
            </span>
            <div className={styles.headerActions}>
              <Menu.Root>
                <Menu.Trigger className={styles.moreButton} aria-label="More actions">
                  •••
                </Menu.Trigger>
                <Menu.Portal>
                  <Menu.Content
                    className={menu.content}
                    style={{ width: 'max-content', minWidth: 180 }}
                    align="end"
                    sideOffset={6}
                  >
                    <Menu.Item className={menu.item} onSelect={copyLink}>
                      Copy task link
                    </Menu.Item>
                    {isOpen && (
                      <Menu.Item className={menu.item} onSelect={() => setCloseOpen(true)}>
                        Close task
                      </Menu.Item>
                    )}
                  </Menu.Content>
                </Menu.Portal>
              </Menu.Root>
            </div>
          </header>
          <p className={styles.description}>{task.description}</p>

          <dl className={styles.facts}>
            {facts.map(([icon, value, label]) => (
              <div key={label}>
                <Icon d={icon} />
                <span>
                  <dd>{value}</dd>
                  <dt>{label}</dt>
                </span>
              </div>
            ))}
          </dl>

          <div className={styles.tabs} role="tablist">
            {(Object.keys(TABS) as Tab[]).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                className={cx(styles.tab, tab === key && styles.tabActive)}
                onClick={() => setTab(key)}
              >
                <Icon d={TABS[key].icon} />
                {TABS[key].label}
                {key === 'proposals' ? <span className={tasks.count}>{proposals.length}</span> : key === 'submission' && <span className={tasks.count}>{submissions?.length}</span>}
              </button>
            ))}
          </div>

          <div className={styles.panel} role="tabpanel">
            {tab === 'proposals' &&
              (proposals.length ? (
                <div className={styles.inbox}>
                  <ul className={styles.inboxList} aria-label="Proposals">
                    {proposals.map((proposal) => {
                      const name = nameOf(proposal);
                      const selected = proposal.id === active?.id;
                      return (
                        <li key={proposal.id}>
                          <button
                            type="button"
                            className={cx(styles.inboxItem, selected && styles.inboxItemActive)}
                            aria-current={selected || undefined}
                            onClick={() => setActiveId(proposal.id)}
                          >
                            <span className={styles.avatar} aria-hidden="true">
                              {initials(name)}
                            </span>
                            <span className={styles.inboxText}>
                              <span className={styles.inboxName}>{name}</span>
                              <span className={styles.inboxMeta}>
                                {formatEstimate(proposal.proposed_hours)} · <DateLabel value={proposal.created_at} />
                              </span>
                            </span>
                            {proposal.status === 'pending' && (
                              <span className={styles.dot} aria-label="Pending" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  {active && (
                    <article className={styles.detail} key={active.id}>
                      <header className={styles.detailHead}>
                        <span className={cx(styles.avatar, styles.avatarLg)} aria-hidden="true">
                          {initials(nameOf(active))}
                        </span>
                        <div className={styles.detailWho}>
                          <h3>{nameOf(active)}</h3>
                          <p>
                            Sent <DateLabel value={active.created_at} />
                          </p>
                        </div>
                        <StatusBadge status={active.status} />
                        
                      </header>

                      <dl className={styles.stats}>
                        <div>
                          <dt>Estimate</dt>
                          <dd>{formatEstimate(active.proposed_hours)}</dd>
                        </div>
                        <div>
                          <dt>Questions</dt>
                          <dd>{active.questions?.length ?? 0}</dd>
                        </div>
                      </dl>

                      <section className={styles.detailSection}>
                        <h4>Approach</h4>
                        <p className={styles.approach}>{active.approach}</p>
                      </section>

                      {active.questions?.length > 0 && (
                        <section className={styles.detailSection}>
                          <h4>Questions</h4>
                          <ol className={styles.questions}>
                            {active.questions.map((q) => (
                              <li key={q}>{q}</li>
                            ))}
                          </ol>
                        </section>
                      )}
                      <footer className={styles.detailActions}>
                        <Link className={styles.ghostLink} to={`/profiles/${active.student_id}`}>
                          View profile
                        </Link>

                        {isOpen && !studentSelected && active.status === 'pending' && active.Student && (
                          <ConfirmDialog
                            open={openModal}
                            onOpenChange={setOpenModal}
                            trigger={<Button>Select student</Button>}
                            title={`Select ${nameOf(active)}?`}
                            description="This creates one assignment and closes the other proposals."
                          >
                            <Button
                              busy={sendingNda}
                              onClick={() =>
                                sendNda(
                                  { email: active.Student!.User.email, taskId: active.task_id },
                                  { onSuccess: () => setOpenModal(false) },
                                )
                              }
                            >
                              Confirm selection
                            </Button>
                          </ConfirmDialog>
                        )}
                      </footer>
                    </article>
                  )}
                </div>
              ) : (
                <Empty icon={PATHS.people} title="No proposals yet">
                  <p>Students will see this task in the marketplace and can submit a proposal.</p>
                  <button type="button" className={styles.secondary} onClick={copyLink}>
                    <Icon d={PATHS.link} />
                    Copy task link
                  </button>
                </Empty>
              ))}
            {tab === 'assignment' &&
              (assigned ? (
                <Empty
                  icon={PATHS.layers}
                  title={
                    latest
                      ? `${nameOf(assigned)} submitted their work`
                      : assigned.nda_signed
                        ? `${nameOf(assigned)} is working on this`
                        : `Waiting for ${nameOf(assigned)} to sign the NDA`
                  }
                >
                  {latest ? (
                    <Button onClick={() => setTab('submission')}>View submission →</Button>
                  ) : (
                    <Link className={buttonClass()} to={`/profiles/${assigned.student_id}`}>
                      View student profile →
                    </Link>
                  )}
                </Empty>
              ) : (
                <Empty icon={PATHS.layers} title="No student selected yet">
                  <p>Pick a student from the proposals to create an assignment.</p>
                </Empty>
              ))}
            {tab === 'submission' &&
              (submissionsQuery.isPending ? (
                <p className={text.mutedSmall} role="status">
                  Loading submission…
                </p>
              ) : submissionsQuery.isError ? (
                <ErrorMessage
                  error={submissionsQuery.error}
                  retry={() => submissionsQuery.refetch()}
                />
              ) : submissions.length ? (
                <div className={styles.submissions}>
                  {submissions.map((sub) => {
                    const name = sub.Student?.User ? fullName(sub.Student.User) : 'Student';
                    const filename = `T-${task.id}-submission-${sub.id}.zip`;
                    return (
                      <article key={sub.id} className={styles.submission}>
                        <header className={styles.detailHead}>
                          <span className={cx(styles.avatar, styles.avatarLg)} aria-hidden="true">
                            {initials(name)}
                          </span>
                          <div className={styles.detailWho}>
                            <h3>{name}</h3>
                            <p>Submitted {formatDateTime(sub.submitted_at)}</p>
                          </div>
                          <Badge tone="success">Zip content has passed the checks</Badge>
                        </header>

                        <div className={styles.file}>
                          <Icon d={PATHS.file} />
                          <div className={styles.fileInfo}>
                            <strong>{filename}</strong>
                            <small>Passed automatic checks · ZIP archive</small>
                          </div>
                          <Button
                            variant="secondary"
                            className={styles.fileAction}
                            busy={download.isPending && download.variables?.id === sub.id}
                            onClick={() => download.mutate({ id: sub.id, filename })}
                          >
                            <Icon d={PATHS.download} />
                            Download
                          </Button>
                        </div>

                        <section className={styles.detailSection}>
                          <h4>Notes from the student</h4>
                          <p className={styles.approach}>{sub.notes || 'No notes added.'}</p>
                        </section>

                        {sub.github_url && (
                          <section className={styles.detailSection}>
                            <h4>Repository</h4>
                            <a
                              className={links.textLink}
                              href={sub.github_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {sub.github_url}
                            </a>
                          </section>
                        )}

                        {sub.Student && (
                          <footer className={styles.detailActions}>
                            <Link className={styles.ghostLink} to={`/profiles/${sub.Student.id}`}>
                              View profile
                            </Link>
                            {sub.Review ? (
                              <Badge tone={VERDICT_DISPLAY[sub.Review.status].tone}>
                                {VERDICT_DISPLAY[sub.Review.status].label}
                              </Badge>
                            ) : (
                              <Link
                                to={`/business/tasks/review/${task.id}?submission=${sub.id}`}
                                className={cx(styles.ghostLink, styles.rateLink)}
                              >
                                Review &amp; rate
                              </Link>
                            )}
                          </footer>
                        )}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <Empty icon={PATHS.file} title="No submission yet">
                  <p>The selected student's work will appear here once they submit it.</p>
                </Empty>
              ))}
            {tab === 'review' &&
              (submissionsQuery.isPending ? (
                <p className={text.mutedSmall} role="status">
                  Loading review…
                </p>
              ) : submissionsQuery.isError ? (
                <ErrorMessage
                  error={submissionsQuery.error}
                  retry={() => submissionsQuery.refetch()}
                />
              ) : reviewed.length ? (
                <div className={styles.submissions}>
                  {reviewed.map((sub) => {
                    const r = sub.Review!;
                    const verdict = VERDICT_DISPLAY[r.status];
                    return (
                      <article key={r.id} className={styles.submission}>
                        <header className={styles.detailHead}>
                          <div className={styles.detailWho}>
                            <h3>Your review</h3>
                            <p>
                              Submission #{sub.id} · Reviewed {formatDateTime(r.reviewed_at)}
                            </p>
                          </div>
                          <Badge tone={verdict.tone}>{verdict.label}</Badge>
                        </header>

                        <section className={styles.detailSection}>
                          <h4>Scorecard</h4>
                          <ul className={review.guide}>
                            {REVIEW_SCORES.map(([key, label]) => {
                              const score = Number(r[key]);
                              return (
                                <li key={key}>
                                  <span className={review.guideCells} aria-hidden="true">
                                    {LEVELS.map((l) => (
                                      <span
                                        key={l.value}
                                        className={review.square}
                                        style={l.value <= score ? { backgroundColor: l.color } : undefined}
                                      />
                                    ))}
                                  </span>
                                  <span className={review.checkText}>
                                    <strong>{label}</strong>
                                    <small>
                                      {LEVELS.find((l) => l.value === score)?.name ?? '—'} · {score}/4
                                    </small>
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </section>

                        <section className={styles.detailSection}>
                          <h4>Feedback to the student</h4>
                          <p className={styles.approach}>{r.feedback}</p>
                        </section>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <Empty icon={PATHS.check} title="Nothing reviewed yet">
                  <p>Review and rate the work from the Submission tab once it comes in.</p>
                </Empty>
              ))}
          </div>
        </div>

        <aside className={styles.aside}>
          <Card>
            <h2 className={styles.cardTitle}>Starter files</h2>
            {assetPending ? (
              <p className={text.mutedSmall}>Loading…</p>
            ) : asset ? (
              <div className={styles.file}>
                <Icon d={PATHS.file} />
                <div className={styles.fileInfo}>
                  <strong>{asset.original_filename}</strong>
                  <small>
                    {asset.file_type} · <DateLabel value={asset.uploaded_at} />
                  </small>
                </div>
              </div>
            ) : (
              <p className={text.mutedSmall}>No starter files were uploaded with this task.</p>
            )}
          </Card>
          <Card>
            <h2 className={styles.cardTitle}>Activity</h2>
            <ol className={styles.timeline}>
              {/* newest first: a review of the latest submission sits above it, an older one below */}
              {latest?.Review && reviewActivity(latest.Review)}
              {latest && (
                <li>
                  <strong>Work submitted</strong>
                  <small>{formatDateTime(latest.submitted_at)}</small>
                </li>
              )}
              {!latest?.Review && latestReview && reviewActivity(latestReview)}
              {asset && (
                <li>
                  <strong>Starter files uploaded</strong>
                  <small>{formatDateTime(asset.uploaded_at)}</small>
                </li>
              )}
              <li>
                <strong>Task created</strong>
                <small>{formatDateTime(task.created_at)}</small>
              </li>
              {details?.task_assets?.status === 'rejected' &&
              <li className={styles.timelineRejected}>
                <strong>Task Rejected</strong>
                <small>please revise your zip</small>
                <Link className={links.textLink} to={`/business/tasks/${id}/revise`}>
                  Revise the zip
                </Link>
              </li>
              }
            </ol>
          </Card>
        </aside>
      </div>

      {/* Opened from the ••• menu */}
      <ConfirmDialog
        open={closeOpen}
        onOpenChange={setCloseOpen}
        trigger={<span hidden />}
        title="Close this task?"
        description="This stops new proposals and rejects the pending proposals. You can post a new task later."
      >
        <Button variant="danger">Confirm close</Button>
      </ConfirmDialog>
    </>
  );
}
