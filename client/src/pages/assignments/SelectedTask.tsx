import { Link, useParams } from 'react-router-dom';
import { ErrorMessage, Loading, buttonClass } from '../../components/ui';
import { DIFFICULTY_LABELS, TASK_TYPE_LABELS } from '../../constants/tasks';
import { formatEstimate, initials } from '../../utils/task-display';
import { useAssignedTask } from '../nda/hooks/use-nda';
import styles from './SelectedTask.module.css';
import { useDownload } from './hooks';

const ICON = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

const NEXT_STEPS = [
  'Download the project files and read the brief.',
  'Build the task within the estimated effort.',
  'Submit your work for the company to review.',
];

export default function SelectedTask() {
  const taskId = Number(useParams().taskId);
  const { data, isPending, error, refetch } = useAssignedTask(taskId);

  const { mutate: download, isPending: downloading } = useDownload(taskId);

  if (isPending) return <Loading />;
  if (error) return <ErrorMessage error={error} retry={refetch} />;

  const { task, proposal } = data;
  const company = task.Company;
  const file = task.TaskAsset;
  const facts = [
    ['Type', TASK_TYPE_LABELS[task.task_type]?.label ?? task.task_type],
    ['Difficulty', DIFFICULTY_LABELS[task.difficulty] ?? task.difficulty],
    ['Estimate', task.estimated_hours != null ? formatEstimate(task.estimated_hours) : '—'],
    ['Your estimate', formatEstimate(proposal.proposed_hours)],
    ['Due', task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'],
  ];

  return (
    <div className={styles.page}>
      <Link className={styles.back} to="/student/proposals">
        <svg {...ICON} width={16} height={16}>
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
        Back to proposals
      </Link>

      <header className={styles.hero}>
        <div className={styles.heroTop}>
          <span className={styles.logo} aria-hidden="true">
            {initials(company?.name ?? '?')}
          </span>
          <div className={styles.heroText}>
            <p className={styles.company}>{company?.name ?? 'Company'}</p>
            <h1 className={styles.title}>{task.title}</h1>
          </div>
          <span className={styles.status}>In progress</span>
        </div>

        <dl className={styles.facts}>
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className={styles.grid}>
        <div className={styles.main}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Brief</h2>
            <p className={styles.body}>{task.description || 'No description provided.'}</p>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Project files</h2>
            {file ? (
              <button
                type="button"
                className={styles.file}
                disabled={downloading}
              >
                <span className={styles.fileIcon}>
                  <svg {...ICON} width={20} height={20}>
                    <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" />
                  </svg>
                </span>
                <span className={styles.fileText}>
                  <span className={styles.fileName}>{file.original_filename}</span>
                  <span className={styles.fileMeta}>{file.file_type.toUpperCase()} archive</span>
                </span>
                <span onClick={() => download(file.original_filename)} className={styles.download}>
                  <svg {...ICON} width={16} height={16}>
                    <path d="M12 4v12M6 10l6 6 6-6M4 20h16" />
                  </svg>
                  {downloading ? 'Downloading…' : 'Download'}
                </span>
              </button>
            ) : (
              <p className={styles.empty}>The company hasn’t attached any files to this task.</p>
            )}
          </section>
        </div>

        <aside className={styles.side}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Next steps</h2>
            <ol className={styles.steps}>
              {NEXT_STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <Link className={buttonClass('dark', styles.submit)} to={`/assignment/${taskId}/submit`}>
              Submit work
            </Link>
          </section>

          <section className={styles.nda}>
            <svg {...ICON} width={20} height={20}>
              <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <p>
              NDA signed. Keep {company?.name ?? 'the company'}’s files and details confidential.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
