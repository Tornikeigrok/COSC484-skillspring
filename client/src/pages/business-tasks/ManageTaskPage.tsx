import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as Menu from '@radix-ui/react-dropdown-menu';
import { toast } from 'sonner';
import { fullName } from '../../lib/types';
import {
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
import { sampleAssignments } from '../assignments/constants/sample-assignments';
import { sampleTaskProposals } from './constants/sample-tasks';
import { statusTone } from './constants/posted-tasks';
import { PATHS, TABS } from './constants/manage-task';
import type { Tab } from './constants/manage-task';
import { formatDateTime } from './utils/format-date-time';
import { cx } from '../../utils/cx';
import { formatEstimate } from '../../utils/task-display';
import links from '../../styles/links.module.css';
import text from '../../styles/text.module.css';
import tasks from './BusinessTasksPage.module.css';
import { Empty } from './components/Empty';
import { Icon } from './components/Icon';
import styles from './ManageTaskPage.module.css';
import { useFetchAllTasks, useTaskDetails } from './hooks';


export default function ManageTaskPage() {
  const { id } = useParams();
  
  const { data: allTasks, isPending, isError, error, refetch } = useFetchAllTasks();
  const { data: details, isPending: assetPending } = useTaskDetails(id);
  const [tab, setTab] = useState<Tab>('proposals');
  const [closeOpen, setCloseOpen] = useState(false);
  const task = allTasks?.find((t) => String(t.id) === id);
  const asset = details?.task_assets?.TaskAsset;


  const proposals = sampleTaskProposals;
  const assigned = sampleAssignments.find((a) => a.task.id === id);
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
    [PATHS.calendar, <DateLabel value={task.created_at} />, 'Posted'],
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
                {key === 'proposals' && <span className={tasks.count}>{proposals.length}</span>}
              </button>
            ))}
          </div>

          <div className={styles.panel} role="tabpanel">
            {tab === 'proposals' &&
              (proposals.length ? (
                <ul className={styles.proposals}>
                  {proposals.map((proposal) => (
                    <li key={proposal.id}>
                      <div className={styles.proposalHead}>
                        <h3>
                          <Link to={`/profiles/${proposal.student.id}`}>
                            {fullName(proposal.student)}
                          </Link>
                        </h3>
                        <StatusBadge status={proposal.status} />
                      </div>
                      <p className={text.mutedSmall}>
                        Estimated effort: {proposal.estimated_hours} hours
                      </p>
                      <p className={text.longText}>{proposal.message}</p>
                      <div className={styles.proposalActions}>
                        <Link className={links.textLink} to={`/profiles/${proposal.student.id}`}>
                          View student profile →
                        </Link>
                        {isOpen && proposal.status === 'pending' && (
                          <ConfirmDialog
                            trigger={<Button>Select student</Button>}
                            title={`Select ${fullName(proposal.student)}?`}
                            description="This creates one assignment and closes the other proposals."
                          >
                            <Button>Confirm selection</Button>
                          </ConfirmDialog>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
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
                <Empty icon={PATHS.layers} title="A student is working on this">
                  <Link className={buttonClass()} to={`/assignments/${assigned.id}`}>
                    Open assignment →
                  </Link>
                </Empty>
              ) : (
                <Empty icon={PATHS.layers} title="No student selected yet">
                  <p>Pick a student from the proposals to create an assignment.</p>
                </Empty>
              ))}
            {tab === 'submission' && (
              <Empty icon={PATHS.file} title="No submission yet">
                <p>The selected student's work will appear here once they submit it.</p>
              </Empty>
            )}
            {tab === 'review' && (
              <Empty icon={PATHS.check} title="Nothing to review yet">
                <p>Review and approve the work after a submission comes in.</p>
              </Empty>
            )}
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
