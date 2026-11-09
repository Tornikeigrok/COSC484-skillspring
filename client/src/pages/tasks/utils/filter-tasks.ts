import { DIFFICULTIES } from '../../../constants/tasks';
import type { TaskSort } from '../../../constants/tasks';
import type { AvailableTask } from '../hooks';

export interface TaskFilters {
  q: string;
  types: string[];
  difficulties: string[];
  sort: TaskSort;
}

// Client-side search, type/difficulty filters and sort over the tasks GET /api/tasks returned.
export function filterTasks(
  tasks: AvailableTask[],
  { q, types, difficulties, sort }: TaskFilters,
): AvailableTask[] {
  const needle = q.toLowerCase();
  const rank = (task: AvailableTask) => DIFFICULTIES.indexOf(task.difficulty);
  // tasks without an estimate sort last under "shortest first"
  const hours = (task: AvailableTask) => task.estimated_hours ?? Infinity;
  return tasks
    .filter((task) => !types.length || types.includes(task.task_type))
    .filter((task) => !difficulties.length || difficulties.includes(task.difficulty))
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

// Tasks whose text mentions the most of the student's skills, easiest first on ties.
export function recommendTasks(tasks: AvailableTask[], skills: string[], count: number) {
  const wanted = skills.map((s) => s.toLowerCase());
  const score = (task: AvailableTask) => {
    const text = `${task.title} ${task.description}`.toLowerCase();
    return wanted.filter((s) => text.includes(s)).length;
  };
  return tasks
    .map((task) => ({ task, score: score(task) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        DIFFICULTIES.indexOf(a.task.difficulty) - DIFFICULTIES.indexOf(b.task.difficulty),
    )
    .slice(0, count)
    .map(({ task }) => task);
}
