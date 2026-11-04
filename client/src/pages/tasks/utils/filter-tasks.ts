import { DIFFICULTIES } from '../../../constants/tasks';
import type { TaskSort } from '../../../constants/tasks';
import type { AvailableTask } from '../hooks';

// Client-side search, category filter and sort over the tasks GET /api/tasks returned.
export function filterTasks(
  tasks: AvailableTask[],
  { q, category, sort }: { q: string; category: string; sort: TaskSort },
): AvailableTask[] {
  const needle = q.toLowerCase();
  const rank = (task: AvailableTask) => DIFFICULTIES.indexOf(task.difficulty);
  // tasks without an estimate sort last under "shortest first"
  const hours = (task: AvailableTask) => task.estimated_hours ?? Infinity;
  return tasks
    .filter((task) => !category || task.task_type === category)
    .filter(
      (task) =>
        !needle ||
        [task.title, task.description, task.Company.name].some((text) =>
          text.toLowerCase().includes(needle),
        ),
    )
    .sort((a, b) => {
      if (sort === 'shortest') return hours(a) - hours(b);
      if (sort === 'easiest') return rank(a) - rank(b);
      return b.created_at.localeCompare(a.created_at);
    });
}
