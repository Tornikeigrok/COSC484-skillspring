import { DateLabel, EmptyState, ErrorMessage, Loading } from '../../components/ui';
import type { ReviewedItem } from './hooks';
import styles from './ReviewedTasks.module.css';

// Order = radar axes clockwise from the top.
const METRICS = [
  ['quality', 'Code quality'],
  ['functionality', 'Functionality'],
  ['documentation', 'Documentation'],
  ['communication', 'Communication'],
] as const;

const VERDICT: Record<number, string> = { 1: 'Weak', 2: 'Fair', 3: 'Solid', 4: 'Strong', 5: 'Excellent' };

const values = (review: ReviewedItem['Review']) => METRICS.map(([key]) => Number(review[key]) || 0);
const average = (nums: number[]) => nums.reduce((a, b) => a + b, 0) / (nums.length || 1);

export function ReviewedTasks({
  reviews,
  isPending = false,
  error,
  retry,
  forCompany = false,
}: {
  reviews?: ReviewedItem[];
  isPending?: boolean;
  error?: unknown;
  retry?: () => void;
  /** Company viewing a student: hides private reviewer feedback, third-person copy. */
  forCompany?: boolean;
}) {
  const accepted = reviews?.filter((r) => r.Review.status === 'accept').length ?? 0;
  const avg = average(reviews?.map((r) => average(values(r.Review))) ?? []);

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Verified work</h2>
      {error ? (
        <ErrorMessage error={error} retry={retry} />
      ) : isPending ? (
        <Loading />
      ) : !reviews?.length ? (
        <EmptyState title="No reviewed submissions yet.">
          {forCompany
            ? 'Reviewed tasks from this student will appear here.'
            : 'Tasks appear here once a business reviews your submission.'}
        </EmptyState>
      ) : (
        <>
          <dl className={styles.stats}>
            <div>
              <dt>Reviews</dt>
              <dd>{reviews.length}</dd>
            </div>
            <div>
              <dt>Acceptance</dt>
              <dd>{Math.round((accepted / reviews.length) * 100)}%</dd>
            </div>
            <div>
              <dt>Avg score</dt>
              <dd>
                {avg.toFixed(1)}
                <small>/5</small>
              </dd>
            </div>
          </dl>
          <ul className={styles.list}>
            {reviews.map((item) => (
              <ReviewCard key={item.id} item={item} showFeedback={!forCompany} />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function ReviewCard({ item, showFeedback }: { item: ReviewedItem; showFeedback: boolean }) {
  const Task = item.Proposal?.Task;
  const review = item.Review;
  const scores = values(review);
  const accepted = review.status === 'accept';
  const company = Task?.Company.name ?? review.Company?.name;
  const website = review.Company?.website;
  const best = scores.indexOf(Math.max(...scores));
  const worst = scores.indexOf(Math.min(...scores));

  return (
    <li className={styles.card}>
      <div className={styles.chart}>
        <Radar scores={scores} />
        <p className={styles.overall}>
          {average(scores).toFixed(1)}
          <small>/5</small>
        </p>
      </div>

      <div className={styles.body}>
        <div className={styles.top}>
          <span className={styles.logo} aria-hidden="true">
            {(company ?? '?')[0]}
          </span>
          <div className={styles.heading2}>
            <h3 className={styles.title}>
              {website ? (
                <a href={website} target="_blank" rel="noreferrer">
                  {company} <span aria-hidden="true">↗</span>
                </a>
              ) : (
                company ?? 'Company project'
              )}
            </h3>
            <p className={styles.role}>
              {Task ? Task.title : 'Project contributor'}
              {Task && <span className={styles.tag}>{Task.task_type}</span>}
              {Task && <span className={styles.tag}>{Task.difficulty}</span>}
            </p>
            <p className={styles.meta}>
              <DateLabel value={review.reviewed_at} />
              <span aria-hidden="true">·</span>
              <span>Submission #{item.id}</span>
            </p>
          </div>
          <span className={styles.status} data-accepted={accepted}>
            {accepted ? 'Accepted' : 'Not accepted'}
          </span>
        </div>

        <dl className={styles.metrics}>
          {METRICS.map(([key, label], i) => (
            <div key={key}>
              <dt>
                {label}
                <span>
                  <b>{scores[i]}</b>/5 · {VERDICT[Math.round(scores[i])] ?? '—'}
                </span>
              </dt>
              <dd className={styles.meter} aria-label={`${scores[i]} out of 5`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} data-on={n <= scores[i]} />
                ))}
              </dd>
            </div>
          ))}
        </dl>

        {best !== worst && (
          <p className={styles.insight}>
            <span>
              Strongest <strong>{METRICS[best][1]}</strong>
            </span>
            <span>
              Focus area <strong>{METRICS[worst][1]}</strong>
            </span>
          </p>
        )}

        {showFeedback && review.feedback && <blockquote className={styles.feedback}>{review.feedback}</blockquote>}
      </div>
    </li>
  );
}

const SIZE = 132;
const C = SIZE / 2;
const R = 50;
// Unit vectors for top, right, bottom, left axes.
const AXES = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
] as const;
const point = (ratios: number[]) => AXES.map(([x, y], i) => `${C + x * R * ratios[i]},${C + y * R * ratios[i]}`).join(' ');

function Radar({ scores }: { scores: number[] }) {
  return (
    <svg
      className={styles.radar}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={METRICS.map(([, label], i) => `${label} ${scores[i]}`).join(', ')}
    >
      {[1, 0.8, 0.6, 0.4, 0.2].map((ring) => (
        <polygon key={ring} className={styles.grid} points={point([ring, ring, ring, ring])} />
      ))}
      <line className={styles.grid} x1={C} y1={C - R} x2={C} y2={C + R} />
      <line className={styles.grid} x1={C - R} y1={C} x2={C + R} y2={C} />
      <polygon className={styles.shape} points={point(scores.map((s) => s / 5))} />
      {AXES.map(([x, y], i) => (
        <circle key={i} className={styles.vertex} r={3} cx={C + x * R * (scores[i] / 5)} cy={C + y * R * (scores[i] / 5)} />
      ))}
      {['Q', 'F', 'D', 'C'].map((letter, i) => (
        <text key={letter} className={styles.axis} x={C + AXES[i][0] * (R + 9)} y={C + AXES[i][1] * (R + 9)}>
          {letter}
        </text>
      ))}
    </svg>
  );
}
