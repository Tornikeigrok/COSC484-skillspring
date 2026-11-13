import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { EmptyState, ErrorMessage, FieldError, Loading } from '../../components/ui';
import { TASK_SORTS } from '../../constants/tasks';
import type { TaskSort } from '../../constants/tasks';
import links from '../../styles/links.module.css';
import {
  Dropdown,
  DropdownMenu,
  DropdownRadioGroup,
  DropdownRadioItem,
  DropdownTrigger,
} from '../../ui/radix-dropdown';
import { cx } from '../../utils/cx';
import { DiscoverAside } from './components/DiscoverAside';
import { Svg } from './components/Svg';
import { TaskFilters } from './components/TaskFilters';
import { TaskRow } from './components/TaskRow';
import { ASIDE_ID, FILTER_KEYS, ICONS, PARAM, TASK_TABS } from './constants/discover';
import type { FilterKey, TaskTab } from './constants/discover';
import { useGetAllTasks } from './hooks';
import { filterTasks, heroStats } from './utils/filter-tasks';
import { taskSearchSchema } from './utils/tasks-validations';
import styles from './TasksPage.module.css';

const IS_MAC = typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent);
const list = (value: string | null) => (value ? value.split(',') : []);

export default function TasksPage() {
  const [params, setParams] = useSearchParams();
  const [error, setError] = useState<string>();
  const searchRef = useRef<HTMLInputElement>(null);
  const [asideOpen, setAsideOpen] = useState(true);

  const q = params.get(PARAM.q) || '';
  const filters = Object.fromEntries(
    FILTER_KEYS.map((key) => [key, list(params.get(PARAM[key]))]),
  ) as Record<FilterKey, string[]>;
  const sortParam = params.get(PARAM.sort) || '';
  const sort: TaskSort = sortParam in TASK_SORTS ? (sortParam as TaskSort) : 'recent';
  const tabParam = params.get(PARAM.tab) || '';
  const tab: TaskTab = tabParam in TASK_TABS ? (tabParam as TaskTab) : 'all';

  const { data: allTasks = [], isPending, isError, error: loadError, refetch } = useGetAllTasks();
  const filtered = filterTasks(allTasks, {
    q,
    types: filters.type,
    difficulties: filters.difficulty,
    sort,
  });
  // ponytail: filters.tech is only kept in the URL until the server filters by tech stack;
  const tasks = filtered.filter(TASK_TABS[tab].match);

  // ⌘K / Ctrl+K jumps to search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  function toggle(key: FilterKey, value: string) {
    const current = filters[key];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    update(PARAM[key], next.join(','));
  }

  function clearFilters() {
    const next = new URLSearchParams(params);
    FILTER_KEYS.forEach((key) => next.delete(PARAM[key]));
    setParams(next, { replace: true });
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
    update(PARAM.q, result.data.q);
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="discover-title">
        <div className={styles.heroTop}>
          <div>
            <h1 id="discover-title" className={styles.heroTitle}>
              Discover <span className={styles.accent}>tasks</span>
            </h1>
            <p className={styles.heroDescription}>
              Real technical work from verified companies. Pick one, ship it, grow your portfolio.
            </p>
          </div>

          {!isPending && !isError && (
            <dl className={styles.stats}>
              {heroStats(allTasks).map((stat) => (
                <div key={stat.label} className={styles.stat}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <form key={q} role="search" onSubmit={search} noValidate className={styles.search}>
          <Svg d={ICONS.search} size={18} className={styles.searchIcon} />
          <label htmlFor={PARAM.q} className={styles.srOnly}>
            Search tasks
          </label>
          <input
            ref={searchRef}
            id={PARAM.q}
            name={PARAM.q}
            type="search"
            className={styles.searchInput}
            placeholder="Search tasks, companies, or keywords…"
            defaultValue={q}
            aria-invalid={!!error}
            aria-describedby={error ? 'q-error' : undefined}
            onChange={() => setError(undefined)}
          />
          <kbd className={styles.kbd}>{IS_MAC ? '⌘ K' : 'Ctrl K'}</kbd>
        </form>
        <FieldError id="q-error" message={error} />
      </section>

      <div className={cx(styles.layout, !asideOpen && styles.layoutCollapsed)}>
        <TaskFilters selected={filters} onToggle={toggle} onClear={clearFilters} />

        <section className={styles.results} aria-label="Tasks">
          <div className={styles.toolbar}>
            <div className={styles.tabs} role="tablist" aria-label="Task views">
              {Object.entries(TASK_TABS).map(([key, { label, match }]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={tab === key}
                  className={cx(styles.tab, tab === key && styles.tabActive)}
                  onClick={() => update(PARAM.tab, key === 'all' ? '' : key)}
                >
                  {label}
                  <span className={styles.count}>{filtered.filter(match).length}</span>
                </button>
              ))}
            </div>

            <Dropdown>
              <DropdownTrigger className={styles.sort} aria-label="Sort tasks">
                <span>
                  <span>{TASK_SORTS[sort]}</span>
                </span>
              </DropdownTrigger>
              <DropdownMenu align="end" className={styles.sortMenu}>
                <DropdownRadioGroup value={sort} onValueChange={(v) => update(PARAM.sort, v)}>
                  {Object.entries(TASK_SORTS).map(([value, label]) => (
                    <DropdownRadioItem key={value} value={value}>
                      {label}
                    </DropdownRadioItem>
                  ))}
                </DropdownRadioGroup>
              </DropdownMenu>
            </Dropdown>

            <button
              type="button"
              className={cx(styles.asideToggle, asideOpen && styles.asideToggleActive)}
              aria-expanded={asideOpen}
              aria-controls={ASIDE_ID}
              aria-label={asideOpen ? 'Hide side panel' : 'Show side panel'}
              title={asideOpen ? 'Hide side panel' : 'Show side panel'}
              onClick={() => setAsideOpen(!asideOpen)}
            >
              <Svg d={ICONS.menu} size={18} />
            </button>
          </div>

          {isPending ? (
            <Loading />
          ) : isError ? (
            <ErrorMessage error={loadError} retry={() => refetch()} />
          ) : tasks.length ? (
            <ul className={styles.list}>
              {tasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No tasks found"
              action={
                params.size > 0 && (
                  <Link to="/tasks" className={links.textLink}>
                    Clear filters
                  </Link>
                )
              }
            >
              Try a different search or filter.
            </EmptyState>
          )}
        </section>

        {asideOpen && <DiscoverAside tasks={allTasks} />}
      </div>
    </div>
  );
}
