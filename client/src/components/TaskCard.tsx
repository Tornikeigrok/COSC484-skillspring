import { Link } from 'react-router-dom';
import { Badge, Card, StatusBadge } from './ui';
import { categories } from '../lib/types';
import type { Task } from '../lib/types';
export function TaskCard({ task, manage = false }: { task: Task; manage?: boolean }) {
  return (
    <Card className="task-card">
      <div className="row between">
        <span className="eyebrow">{categories[task.category]}</span>
        <StatusBadge status={task.status} />
      </div>
      <h2>
        <Link to={`/tasks/${task.id}`}>{task.title}</Link>
      </h2>
      <p className="company-name">
        {task.company.name}
        {task.company.verification_status === 'verified' && (
          <span title="Company identity verified"> ✓</span>
        )}
      </p>
      <p className="line-clamp-3 muted">{task.description}</p>
      <div className="tags">
        {task.skills.map((skill) => (
          <Badge key={skill}>{skill}</Badge>
        ))}
      </div>
      <div className="task-footer">
        <span>
          {task.estimated_hours} hours · {task.difficulty}
        </span>
        <Link
          className="text-link"
          to={manage ? `/business/tasks/${task.id}/proposals` : `/tasks/${task.id}`}
        >
          {manage ? 'Manage task' : 'View task'} <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </Card>
  );
}
