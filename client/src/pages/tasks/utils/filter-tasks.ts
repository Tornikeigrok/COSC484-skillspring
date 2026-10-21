import type { Task } from '../../../lib/types';
import { DIFFICULTIES } from '../../../constants/tasks';
import type { TaskSort } from '../../../constants/tasks';

// Client-side stand-in for the GET /tasks filters while the page uses sample data.
export function filterTasks(
  tasks: Task[],
  { q, category, sort }: { q: string; category: string; sort: TaskSort },
): Task[] {
  const needle = q.toLowerCase();
  const rank = (task: Task) => DIFFICULTIES.indexOf(task.difficulty as never);
  return tasks
    .filter((task) => !category || task.category === category)
    .filter(
      (task) =>
        !needle ||
        [task.title, task.description, task.company.name, ...task.skills].some((text) =>
          text.toLowerCase().includes(needle),
        ),
    )
    .sort((a, b) => {
      if (sort === 'shortest') return a.estimated_hours - b.estimated_hours;
      if (sort === 'easiest') return rank(a) - rank(b);
      return b.createdAt.localeCompare(a.createdAt);
    });
}