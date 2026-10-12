import { Link } from 'react-router-dom';
import { Badge, Card, StatusBadge } from './ui';
import { categories } from '../lib/types';
import links from '../styles/links.module.css';
import styles from './TaskCard.module.css';
import type { Task } from '../lib/types';
export function TaskCard({ task, manage = false }: { task: Task; manage?: boolean }) {
  return (
    <Card className={styles.card}>
      <div className={styles.topRow}>
        <span className={styles.category}>
          {categories[task.category]}
        </span>
        <StatusBadge status={task.status} />
      </div>
      <h2>
        <Link to={`/tasks/${task.id}`}>{task.title}</Link>
      </h2>
      <p className={styles.company}>
        {task.company.name}
        {task.company.verification_status === 'verified' && (
          <span title="Company identity verified"> ✓</span>
        )}
      </p>
      <p className={styles.description}>{task.description}</p>
      <div className={styles.skills}>
        {task.skills.map((skill) => (
          <Badge key={skill}>{skill}</Badge>
        ))}
      </div>
      <div className={styles.footer}>
        <span>
          {task.estimated_hours} hours · {task.difficulty}
        </span>
        <Link
          className={links.textLink}
          to={manage ? `/business/tasks/${task.id}/proposals` : `/tasks/${task.id}`}
        >
          {manage ? 'Manage task' : 'View task'} <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </Card>
  );
}
