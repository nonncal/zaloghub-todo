import type { Filter } from '../types'

interface Props {
  value: Filter
  counts: Record<Filter, number>
  onChange: (filter: Filter) => void
}

const LABELS: Record<Filter, string> = {
  all: 'Все',
  active: 'Активные',
  completed: 'Выполненные',
}

export function FilterTabs({ value, counts, onChange }: Props) {
  return (
    <div className="filters" role="group" aria-label="Показать задачи">
      {(Object.keys(LABELS) as Filter[]).map((filter) => (
        <button
          key={filter}
          type="button"
          className="filters__button"
          aria-pressed={value === filter}
          onClick={() => onChange(filter)}
        >
          <span>{LABELS[filter]}</span>
          <span className="filters__count">{counts[filter]}</span>
        </button>
      ))}
    </div>
  )
}
