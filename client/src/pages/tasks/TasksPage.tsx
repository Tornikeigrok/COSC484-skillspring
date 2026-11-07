import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { categories } from '../../lib/types';
import { EmptyState, ErrorMessage, FieldError, Loading } from '../../components/ui';
import { TaskCard } from '../../components/TaskCard';
import { TASK_SORTS } from '../../constants/tasks';
import type { TaskSort } from '../../constants/tasks';
import links from '../../styles/links.module.css';
import { cx } from '../../utils/cx';
import { filterTasks } from './utils/filter-tasks';
import { taskSearchSchema } from './utils/tasks-validations';
import styles from './TasksPage.module.css';
import { useGetAllTasks } from './hooks';




export default function TasksPage() {
  const [params, setParams] = useSearchParams();
  const [error, setError] = useState<string>();
  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const sortParam = params.get('sort') || '';
  const sort: TaskSort = sortParam in TASK_SORTS ? (sortParam as TaskSort) : 'recent';
  const { data: allTasks = [], isPending, isError, error: loadError, refetch } = useGetAllTasks();
  const tasks = filterTasks(allTasks, { q, category, sort });

  // Dont allow student to pick task without being verified

  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next);
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = taskSearchSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    if (!result.success) {
      setError(result.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    update('q', result.data.q);
  }

  return (
    <>
      <form key={q} role="search" onSubmit={search} noValidate className={styles.search}>
        <svg className={styles.searchIcon} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <label htmlFor="q" className={styles.srOnly}>
          Search projects
        </label>
        <input
          id="q"
          name="q"
          type="search"
          className={styles.searchInput}
          placeholder="Search projects, skills, or companies…"
          defaultValue={q}
          aria-invalid={!!error}
          aria-describedby={error ? 'q-error' : undefined}
          onChange={() => setError(undefined)}
        />
        <kbd className={styles.kbd}>Enter</kbd>
      </form>
      <FieldError id="q-error" message={error} />
      <section className={styles.hero} aria-labelledby="discover-title">
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>Real projects. Real experience.</p>
          <h1 id="discover-title" className={styles.heroTitle}>
            Build <span className={styles.accent}>real-world</span> experience with real companies.
          </h1>
          <p className={styles.heroDescription}>
            Get hands-on experience by working on verified projects from innovative teams. Build
            your skills, grow your portfolio, and stand out.
          </p>
        </div>
        <p className={styles.heroCount}>
          <strong>{allTasks.length}</strong>
          <span>open projects from verified companies</span>
        </p>
      </section>
      <div className={styles.toolbar}>
        <div className={styles.chips} role="group" aria-label="Filter by category">
          {[['', 'All projects'], ...Object.entries(categories)].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={cx(styles.chip, category === value && styles.chipActive)}
              aria-pressed={category === value}
              onClick={() => update('category', value)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className={styles.sort}>
          <span>Sort by:</span>
          <select value={sort} onChange={(e) => update('sort', e.target.value)}>
            {Object.entries(TASK_SORTS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {isPending ? (
        <Loading />
      ) : isError ? (
        <ErrorMessage error={loadError} retry={() => refetch()} />
      ) : tasks.length ? (
        <div className={styles.list}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={{ ...task, id: String(task.id), category: task.task_type, company: task.Company }} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No projects found"
          action={
            params.size > 0 && (
              <Link to="/tasks" className={links.textLink}>
                Clear filters
              </Link>
            )
          }
        >
          Try a different search or category.
        </EmptyState>
      )}
    </>
  );
}