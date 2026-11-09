import { DIFFICULTIES, DIFFICULTY_LABELS, TASK_TYPES, TASK_TYPE_LABELS } from '@/constants/tasks';
import { ICONS } from '../constants/discover';
import { Svg } from './Svg';
import styles from '../TasksPage.module.css';

interface Props {
  types: string[];
  difficulties: string[];
  onToggle: (key: 'type' | 'difficulty', value: string) => void;
  onClear: () => void;
}

const GROUPS = [
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
] as const;

export function TaskFilters({ types, difficulties, onToggle, onClear }: Props) {
  const selected = { type: types, difficulty: difficulties };
  const active = types.length + difficulties.length > 0;

  return (
    <aside className={styles.filters} aria-label="Filters">
      <div className={styles.filtersHead}>
        <h2>Filters</h2>
        {active && (
          <button type="button" className={styles.clear} onClick={onClear}>
            Clear all
          </button>
        )}
      </div>

      {GROUPS.map((group) => (
        <details key={group.key} className={styles.filterGroup} open>
          <summary>
            {group.title}
            <Svg d={ICONS.chevronDown} size={14} className={styles.filterChevron} />
          </summary>
          <fieldset>
            <legend className={styles.srOnly}>{group.title}</legend>
            {group.options.map(([value, label]) => (
              <label key={value} className={styles.check}>
                <input
                  type="checkbox"
                  checked={selected[group.key].includes(value)}
                  onChange={() => onToggle(group.key, value)}
                />
                {label}
              </label>
            ))}
          </fieldset>
        </details>
      ))}
    </aside>
  );
}
