import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorMessage, Loading, buttonClass } from '../../components/ui';
import { TASK_TYPE_LABELS } from '../../constants/tasks';
import { cx } from '../../utils/cx';
import { ICON, ICONS } from './constants/proposal-form';
import { useMyProposals, type MyProposal } from './hooks';
import styles from './ProposalsPage.module.css';

type Status = MyProposal['status'];
type StepState = 'done' | 'current' | 'todo' | 'declined';

const DAY = 86_400_000;

const Svg = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg {...ICON} width={size} height={size}>
    <path d={d} />
  </svg>
);

const shortDate = (v: string) =>
  new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

const waited = (v: string) => {
  const days = Math.floor((Date.now() - Date.parse(v)) / DAY);
  return days < 1 ? 'Today' : days === 1 ? '1 day' : `${days} days`;
};

export default function ProposalsPage() {
  const { data: proposals = [], isPending, error } = useMyProposals();
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const g: Record<Status, MyProposal[]> = { pending: [], accepted: [], rejected: [] };
    for (const p of proposals) {
      if (
        !q ||
        p.Task.title.toLowerCase().includes(q) ||
        p.Task.Company?.name.toLowerCase().includes(q)
      )
        g[p.status].push(p);
    }
    return g;
  }, [proposals, query]);

  if (isPending) return <Loading />;
  if (error) return <ErrorMessage error={error} />;

  const total = proposals.length;
  const count = (s: Status) => proposals.filter((p) => p.status === s).length;
  const pipeline = [
    { key: 'pending', label: 'in review', n: count('pending') },
    { key: 'accepted', label: 'accepted', n: count('accepted') },
    { key: 'rejected', label: 'declined', n: count('rejected') },
  ] as const;
  const noMatch = !groups.pending.length && !groups.accepted.length && !groups.rejected.length;

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>My Proposals</h1>
          <p className={styles.subtitle}>
            Track your proposals from submission to decision.
          </p>
        </div>
        {total > 0 && (
          <label className={styles.search}>
            <Svg d={ICONS.search} size={15} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search proposals..."
              aria-label="Search proposals"
            />
          </label>
        )}
      </header>

      {total === 0 ? (
        <EmptyState
          title="Make your first introduction."
          action={
            <Link className={buttonClass()} to="/tasks">
              Explore tasks
            </Link>
          }
        >
          Find a task you’re excited about and explain your approach.
        </EmptyState>
      ) : (
        <>
          <section className={styles.pipeline} aria-label="Proposal summary">
            <div className={styles.bar}>
              {pipeline.map(
                (s) =>
                  s.n > 0 && (
                    <span key={s.key} className={styles[`seg_${s.key}`]} style={{ flexGrow: s.n }} />
                  ),
              )}
            </div>
            <p className={styles.legend}>
              <span>
                <strong>{total}</strong> submitted
              </span>
              {pipeline.map((s) => (
                <span key={s.key}>
                  <i className={styles[`seg_${s.key}`]} />
                  {s.n} {s.label}
                </span>
              ))}
            </p>
          </section>

          {noMatch && <p className={styles.none}>No proposals match “{query}”.</p>}

          <Group title="Awaiting decision" items={groups.pending} />
          <Group title="Accepted" items={groups.accepted} />
          {groups.rejected.length > 0 && (
            <details className={styles.closed} open={!!query.trim()}>
              <summary className={styles.groupTitle}>
                <Svg d="m9 6 6 6-6 6" size={14} />
                Closed <span>{groups.rejected.length}</span>
              </summary>
              <ProposalList items={groups.rejected} />
            </details>
          )}
        </>
      )}
    </>
  );
}

function Group({ title, items }: { title: string; items: MyProposal[] }) {
  if (!items.length) return null;
  return (
    <section className={styles.group}>
      <h2 className={styles.groupTitle}>
        {title} <span>{items.length}</span>
      </h2>
      <ProposalList items={items} />
    </section>
  );
}

function ProposalList({ items }: { items: MyProposal[] }) {
  return (
    <ul className={styles.list}>
      {items.map((p) => (
        <ProposalRow key={p.id} proposal={p} />
      ))}
    </ul>
  );
}

function ProposalRow({ proposal: p }: { proposal: MyProposal }) {
  const { Task: task } = p;
  const submitted = shortDate(p.created_at);

  // backend only tracks pending/accepted/rejected, so pending = in review
  const steps: { label: string; state: StepState; note?: string }[] =
    p.status === 'rejected'
      ? [
          { label: 'Submitted', state: 'done', note: submitted },
          { label: 'Declined', state: 'declined' },
        ]
      : p.status === 'accepted'
        ? [
            { label: 'Submitted', state: 'done', note: submitted },
            { label: 'Reviewed', state: 'done' },
            { label: 'Accepted', state: 'done' },
          ]
        : [
            { label: 'Submitted', state: 'done', note: submitted },
            { label: 'In review', state: 'current', note: waited(p.created_at) },
            { label: 'Decision', state: 'todo' },
          ];

  return (
    <li className={cx(styles.row, p.status === 'rejected' && styles.rowMuted)}>
      <div className={styles.info}>
        <h3 className={styles.rowTitle}>
          <Link to={`/tasks/${task.id}`}>{task.title}</Link>
        </h3>
        <p className={styles.meta}>
          {[
            task.Company?.name,
            TASK_TYPE_LABELS[task.task_type]?.label ?? task.task_type,
            `${p.proposed_hours}h`,
            `#T-${task.id}`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>

      <ol className={styles.timeline}>
        {steps.map((s) => (
          <li key={s.label} className={cx(styles.step, styles[s.state])}>
            <span className={styles.dot}>
              {s.state === 'done' && <Svg d={ICONS.check} size={10} />}
              {s.state === 'declined' && <Svg d={ICONS.x} size={10} />}
            </span>
            <span className={styles.stepLabel}>{s.label}</span>
            {s.note && <span className={styles.stepNote}>{s.note}</span>}
          </li>
        ))}
      </ol>

      {p.status === 'accepted' ? (
        <Link to="/assignments" className={styles.cta}>
          Start assignment
          <Svg d={ICONS.arrow} size={14} />
        </Link>
      ) : (
        <Link to={`/tasks/${task.id}`} className={styles.go} aria-label={`Open ${task.title}`}>
          <Svg d={ICONS.arrow} />
        </Link>
      )}
    </li>
  );
}
