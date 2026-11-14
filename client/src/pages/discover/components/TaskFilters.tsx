import { useState } from 'react';
import { cx } from '@/utils/cx';
import { DIFFICULTIES, DIFFICULTY_LABELS, TASK_TYPES, TASK_TYPE_LABELS } from '@/constants/tasks';
import { ICONS, TECHNOLOGIES } from '../constants/discover';
import type { FilterKey } from '../constants/discover';
import { Svg } from './Svg';
import styles from '../DiscoverPage.module.css';

interface Props {
  selected: Record<FilterKey, string[]>;
  onToggle: (key: FilterKey, value: string) => void;
  onClear: () => void;
}

const GROUPS: { key: FilterKey; title: string; options: (readonly [string, string])[] }[] = [
  {
    key: 'type',
    title: 'Task type',
    options: TASK_TYPES.map((t) => [t, TASK_TYPE_LABELS[t].label] as const),
  },
  {
    key: 'difficulty',
    title: 'Difficulty',
    options: DIFFICULTIES.map((d) => [d, DIFFICULTY_LABELS[d]] as const),
  },
  {
    key: 'tech',
    title: 'Technologies',
    options: TECHNOLOGIES.map((t) => [t, t] as const),
  },
];

export function TaskFilters({ selected, onToggle, onClear }: Props) {
  const [techQuery, setTechQuery] = useState('');
  const active = Object.values(selected).some((values) => values.length > 0);
  // on small screens the groups hide behind the toggle;
  const [open, setOpen] = useState(false);
  const activeCount = Object.values(selected).reduce((sum, values) => sum + values.length, 0);
  
    return (
    <aside className={cx(styles.filters, open && styles.filtersOpen)} aria-label="Filters">
      <div className={styles.filtersHead}>
        <h2>Filters</h2>
        {active && (
          <button type="button" className={styles.clear} onClick={onClear}>
            Clear all
          </button>
        )}
        <button
          type="button"
          className={styles.filtersToggle}
          aria-expanded={open}
          aria-controls="filter-groups"
          onClick={() => setOpen(!open)}
        >
          {open ? 'Hide' : 'Show'}
          {activeCount > 0 && ` (${activeCount})`}
          <Svg d={ICONS.chevronDown} size={14} className={styles.filterChevron} />
        </button>
      </div>

      <div id="filter-groups" className={styles.filterBody}>
        {GROUPS.map((group) => {
          const isTech = group.key === 'tech';
          const needle = techQuery.trim().toLowerCase();
          const options = isTech
            ? group.options.filter(([, label]) => label.toLowerCase().includes(needle))
            : group.options;

          return (
            <details key={group.key} className={styles.filterGroup} open>
              <summary>
                {group.title}
                <Svg d={ICONS.chevronDown} size={14} className={styles.filterChevron} />
              </summary>

              {isTech && (
                <label className={styles.techSearch}>
                  <Svg d={ICONS.search} size={14} />
                  <span className={styles.srOnly}>Search technologies</span>
                  <input
                    type="search"
                    value={techQuery}
                    onChange={(e) => setTechQuery(e.target.value)}
                    placeholder="Search tech…"
                  />
                </label>
              )}

              <fieldset className={isTech ? styles.techList : undefined}>
                <legend className={styles.srOnly}>{group.title}</legend>
                {options.map(([value, label]) => (
                  <label key={value} className={styles.check}>
                    <input
                      type="checkbox"
                      checked={selected[group.key].includes(value)}
                      onChange={() => onToggle(group.key, value)}
                    />
                    {label}
                  </label>
                ))}
                {!options.length && <p className={styles.noTech}>No matches</p>}
              </fieldset>
            </details>
          );
        })}
      </div>
    </aside>
  );
}
