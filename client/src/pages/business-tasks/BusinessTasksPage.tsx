import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DateLabel, EmptyState, ErrorMessage, Input, PageHeading, buttonClass } from '../../components/ui';
import { STATUS_LABELS } from '../../constants/status';
import { DIFFICULTY_LABELS, TASK_TYPE_LABELS } from '../../constants/tasks';
import { Dropdown, DropdownMenu, DropdownRadioGroup, DropdownRadioItem, DropdownTrigger } from '@/ui/radix-dropdown';
import { cx } from '../../utils/cx';
import { formatEstimate } from '../../utils/task-display';
import { Icon } from './components/Icon';
import RejectionNotice from './components/rejected-task-note';
import styles from './BusinessTasksPage.module.css';
import { FILTERS, ICONS, SORTS, matches, statusTone } from './constants/posted-tasks';
import type { Filter, Sort } from './constants/posted-tasks';
import { useFetchAllTasks } from './hooks';
import type { CompanyTask } from './hooks';

function downloadCsv(tasks: CompanyTask[]) {
  const rows = [
    ['ID', 'Title', 'Type', 'Difficulty', 'Estimated hours', 'Status', 'Posted'],
    ...tasks.map((task) => [
      taskId(task),
      task.title,
      task.task_type,
      task.difficulty,
      task.estimated_hours ?? '',
      task.status,
      task.created_at,
    ]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  link.download = 'posted-tasks.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

const taskId = (task: CompanyTask) => `T-${task.id}`;
const taskUrl = (task: CompanyTask) => `/business/tasks/${task.id}/proposals`;
const plural = (n: number, word: string) => `${n || 'No'} ${word}${n === 1 ? '' : 's'}`;
const titles = (tasks: CompanyTask[]) =>
  tasks.slice(0, 3).map((task) => task.title).join(', ') + (tasks.length > 3 ? '…' : '');

function TaskRow({
  task,
  selected,
  onToggle,
}: {
  task: CompanyTask;
  selected: boolean;
  onToggle: () => void;
}) {
  const proposals = task.proposal_count ?? 0;
  const rejected = task.status === 'rejected';
  const action = matches('review', task.status)
    ? 'Review submission'
    : matches('open', task.status) && proposals
      ? 'Review proposals'
      : null;

  return (
    <li className={cx(styles.row, selected && styles.rowSelected, rejected && styles.rowRejected)}>
      <input
        type="checkbox"
        className={styles.check}
        checked={selected}
        onChange={onToggle}
        aria-label={`Select ${task.title}`}
      />
      <span className={styles.id}>{taskId(task)}</span>
      <div className={styles.main}>
        <h3 className={styles.title}>
          <Link to={taskUrl(task)}>{task.title}</Link>
        </h3>
        <p className={styles.description}>{task.description}</p>
      </div>
      <div className={styles.tags}>
        <span>{TASK_TYPE_LABELS[task.task_type]?.label ?? task.task_type}</span>
        <span className={cx(task.difficulty !== 'easy' && styles.tagAccent)}>
          {DIFFICULTY_LABELS[task.difficulty] ?? task.difficulty}
        </span>
      </div>
      <div className={styles.meta}>
        <span>{task.estimated_hours !== null ? formatEstimate(task.estimated_hours) : 'No estimate'}</span>
        <span className={styles.muted}>
          {matches('open', task.status) ? (
            plural(proposals, 'proposal')
          ) : (
            <>
              Posted <DateLabel value={task.created_at} />
            </>
          )}
        </span>
      </div>
      <span className={cx(styles.status, rejected ? styles.statusRejected : statusTone(task.status))}>
        {rejected ? 'Rejected' : (STATUS_LABELS[task.status] ?? task.status)}
      </span>
      {action ? (
        <Link className={styles.action} to={taskUrl(task)} tabIndex={-1}>
          {action}
          <Icon d={ICONS.arrow} />
        </Link>
      ) : (
        <span className={styles.more} aria-hidden="true">
          •••
        </span>
      )}
      {rejected && <RejectionNotice reasons={task.rejected_reason ?? []} />}
    </li>
  );
}

export default function BusinessTasksPage() {
  const { data: tasks, isPending, isError, error, refetch } = useFetchAllTasks();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('newest');
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const search = query.trim().toLowerCase();
  const filteredTasks =
    tasks?.filter(
      (task) =>
        matches(filter, task.status) &&
        (task.title.toLowerCase().includes(search) ||
          task.description.toLowerCase().includes(search) ||
          taskId(task).toLowerCase().includes(search)),
    ) ?? [];
  // The API returns tasks newest first
  const visibleTasks = sort === 'newest' ? filteredTasks : [...filteredTasks].reverse();
  const needsAction = visibleTasks.filter((task) => matches('review', task.status));
  const otherTasks = visibleTasks.filter((task) => !matches('review', task.status));
  const selectedTasks = tasks?.filter((task) => selected.has(task.id)) ?? [];
  const allSelected = !!visibleTasks.length && visibleTasks.every((task) => selected.has(task.id));

  const openTasks = tasks?.filter((task) => matches('open', task.status)) ?? [];
  const proposalTasks = openTasks.filter((task) => task.proposal_count);
  const proposalTotal = proposalTasks.reduce((sum, task) => sum + (task.proposal_count ?? 0), 0);
  const reviewTasks = tasks?.filter((task) => matches('review', task.status)) ?? [];
  const count = (key: Filter) => tasks?.filter((task) => matches(key, task.status)).length ?? 0;

  const toggle = (id: number) =>
    setSelected((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const group = (label: string, list: CompanyTask[]) =>
    !!list.length && (
      <section className={styles.group}>
        <h2 className={styles.groupTitle}>
          {label} <span>· {list.length}</span>
        </h2>
        <ul className={styles.list}>
          {list.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              selected={selected.has(task.id)}
              onToggle={() => toggle(task.id)}
            />
          ))}
        </ul>
      </section>
    );

  return (
    <>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <span>Company Workspace</span>
        <span aria-hidden="true">›</span>
        <span className={styles.breadcrumbCurrent} aria-current="page">
          Tasks
        </span>
      </nav>
      <PageHeading
        title="Tasks"
        description="Manage work you've shared with students."
        action={
          <div className={styles.actions}>
            {!!tasks?.length && (
              <button
                type="button"
                className={styles.iconButton}
                aria-label="Export tasks as CSV"
                title="Export tasks as CSV"
                disabled={!visibleTasks.length}
                onClick={() => downloadCsv(visibleTasks)}
              >
                <Icon d={ICONS.download} />
              </button>
            )}
            <Link className={buttonClass('dark', styles.newTask)} to="/business/tasks/new">
              + Post a Task
            </Link>
          </div>
        }
      />
      {isPending ? (
        <div className={styles.loading} role="status" aria-label="Loading tasks">
          {[0, 1, 2].map((key) => (
            <div key={key} className={styles.skeleton} />
          ))}
        </div>
      ) : isError ? (
        <ErrorMessage error={error} retry={() => refetch()} />
      ) : tasks.length ? (
        <>
          <dl className={styles.stats}>
            {(
              [
                [tasks.length, 'published'],
                [openTasks.length, 'accepting proposals'],
                [reviewTasks.length, 'awaiting review'],
                [count('closed'), 'finished'],
              ] as const
            ).map(([value, label]) => (
              <div key={label}>
                <dt>{value}</dt>
                <dd>{label}</dd>
              </div>
            ))}
          </dl>

          <section className={styles.attention} aria-labelledby="attention-title">
            <h2 id="attention-title">Needs your attention</h2>
            {proposalTotal || reviewTasks.length ? (
              <ul>
                {!!proposalTotal && (
                  <li>
                    <button type="button" onClick={() => setFilter('open')}>
                      <Icon d={ICONS.people} />
                      <span>
                        <strong>Review {plural(proposalTotal, 'new proposal')}</strong>
                        <small>{titles(proposalTasks)}</small>
                      </span>
                      <Icon d={ICONS.arrow} />
                    </button>
                  </li>
                )}
                {!!reviewTasks.length && (
                  <li>
                    <button type="button" onClick={() => setFilter('review')}>
                      <Icon d={ICONS.fileCheck} />
                      <span>
                        <strong>
                          {reviewTasks.length === 1
                            ? 'Submission ready for review'
                            : `${reviewTasks.length} submissions ready for review`}
                        </strong>
                        <small>{titles(reviewTasks)}</small>
                      </span>
                      <Icon d={ICONS.arrow} />
                    </button>
                  </li>
                )}
              </ul>
            ) : (
              <p className={styles.caughtUp}>
                <strong>You're all caught up</strong>
                <small>
                  {openTasks.length ? 'No proposals yet. ' : ''}New proposals and submissions
                  will show up here.
                </small>
              </p>
            )}
          </section>

          <div className={styles.toolbar}>
            <div className={styles.tabs} role="tablist">
              {(Object.keys(FILTERS) as Filter[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  className={cx(styles.tab, filter === key && styles.tabActive)}
                  aria-selected={filter === key}
                  onClick={() => setFilter(key)}
                >
                  {FILTERS[key].label}
                  <span className={styles.count}>{count(key)}</span>
                </button>
              ))}
            </div>
            <div className={styles.controls}>
              <label className={styles.searchBox}>
                <Icon d={ICONS.search} />
                <Input
                  className={styles.search}
                  type="search"
                  placeholder="Search tasks…"
                  aria-label="Search tasks"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <Dropdown>
                <DropdownTrigger className={styles.sort} aria-label={`Sort tasks: ${SORTS[sort]}`}>
                  {SORTS[sort]}
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownRadioGroup value={sort} onValueChange={(value) => setSort(value as Sort)}>
                    {(Object.keys(SORTS) as Sort[]).map((key) => (
                      <DropdownRadioItem key={key} value={key}>
                        {SORTS[key]}
                      </DropdownRadioItem>
                    ))}
                  </DropdownRadioGroup>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>

          {visibleTasks.length ? (
            <>
              <div className={styles.selectionBar}>
                <label>
                  <input
                    type="checkbox"
                    className={styles.check}
                    checked={allSelected}
                    onChange={() =>
                      setSelected(allSelected ? new Set() : new Set(visibleTasks.map((task) => task.id)))
                    }
                  />
                  {selected.size ? `${selected.size} selected` : 'Select all'}
                </label>
                {!!selected.size && (
                  <>
                    <button type="button" onClick={() => downloadCsv(selectedTasks)}>
                      Export selected
                    </button>
                    <button type="button" onClick={() => setSelected(new Set())}>
                      Clear
                    </button>
                  </>
                )}
              </div>
              {group('Needs action', needsAction)}
              {group(needsAction.length ? 'All other tasks' : 'Tasks', otherTasks)}
            </>
          ) : (
            <p className={styles.noMatches}>
              {search
                ? `No tasks match “${query.trim()}”.`
                : `No ${FILTERS[filter].label.toLowerCase()} tasks right now.`}
            </p>
          )}
        </>
      ) : (
        <EmptyState
          title="No tasks posted yet"
          action={
            <Link className={buttonClass()} to="/business/tasks/new">
              Post your first task
            </Link>
          }
        >
          Tasks your company publishes will appear here. Start with a small, well-defined piece of
          work.
        </EmptyState>
      )}
    </>
  );
}
