import { Link, useParams } from 'react-router-dom';
import { EmptyState, ErrorMessage, Loading, buttonClass } from '../../components/ui';
import CreateTaskPage from './CreateTaskPage';
import { useFetchAllTasks } from './hooks';

// Loads the rejected task, then shows the create form pre-filled with it
export default function ReviseTaskPage() {
  const { id } = useParams();
  const { data: tasks, isPending, isError, error, refetch } = useFetchAllTasks();

  if (isPending) return <Loading />;
  if (isError) return <ErrorMessage error={error} retry={refetch} />;

  const task = tasks.find((t) => String(t.id) === id);
  const back = (
    <Link className={buttonClass()} to="/business/tasks">
      Back to tasks
    </Link>
  );

  if (!task) {
    return (
      <EmptyState title="Task not found" action={back}>
        This task doesn't exist or isn't yours.
      </EmptyState>
    );
  }
  if (task.status !== 'rejected') {
    return (
      <EmptyState title="This task can't be revised" action={back}>
        Only tasks that automated review rejected can be revised.
      </EmptyState>
    );
  }

  return <CreateTaskPage key={task.id} revise={task} />;
}
