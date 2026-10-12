import { Link } from 'react-router-dom';
import { TaskCard } from '../../components/TaskCard';
import { EmptyState, PageHeading, buttonClass } from '../../components/ui';
import layout from '../../styles/layout.module.css';
import { sampleBusinessTasks } from './constants/sample-tasks';

export default function BusinessTasksPage() {
  return (
    <>
      <PageHeading
        eyebrow="MAKE SPACE FOR TALENT"
        title="My tasks"
        description="Focused projects. Fresh perspectives. Meaningful outcomes."
        action={
          <Link className={buttonClass()} to="/business/tasks/new">
            + Post a task
          </Link>
        }
      />
      {sampleBusinessTasks.length ? (
        <div className={layout.cardGrid}>
          {sampleBusinessTasks.map((task) => (
            <TaskCard key={task.id} task={task} manage />
          ))}
        </div>
      ) : (
        <EmptyState
          title="What could a fresh perspective solve?"
          action={
            <Link className={buttonClass()} to="/business/tasks/new">
              Post your first task
            </Link>
          }
        >
          Start with a small, well-defined piece of work.
        </EmptyState>
      )}
    </>
  );
}
