import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FilterTabs } from './components/FilterTabs'
import { TodoForm } from './components/TodoForm'
import { TodoItem } from './components/TodoItem'
import { UndoToast } from './components/UndoToast'
import { useHashFilter } from './hooks/useHashFilter'
import { useTodos } from './hooks/useTodos'
import { plural } from './lib/plural'
import { filterTodos } from './lib/todos'
import type { Filter, Todo } from './types'

const UNDO_TIMEOUT = 6000

const EMPTY_TEXT: Record<Filter, string> = {
  all: 'Список пуст. Добавьте первую задачу — она сохранится и после перезагрузки страницы.',
  active: 'Активных задач нет. Всё, что было запланировано, выполнено.',
  completed: 'Выполненных задач пока нет. Отметьте задачу галочкой, и она появится здесь.',
}

const today = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }).format(
  new Date(),
)

export default function App() {
  const { todos, findIndex, add, toggle, rename, remove, restore, clearCompleted } = useTodos()
  const [filter, setFilter] = useHashFilter()
  const [removed, setRemoved] = useState<{ todo: Todo; index: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const counts = useMemo(() => {
    const completed = todos.filter((t) => t.completed).length
    return { all: todos.length, active: todos.length - completed, completed }
  }, [todos])

  const visible = useMemo(() => filterTodos(todos, filter), [todos, filter])

  const handleRemove = useCallback(
    (id: string) => {
      const index = findIndex(id)
      if (index === -1) return
      setRemoved({ todo: todos[index], index })
      remove(id)
    },
    [findIndex, remove, todos],
  )

  const handleUndo = useCallback(() => {
    if (!removed) return
    restore(removed.todo, removed.index)
    setRemoved(null)
  }, [removed, restore])

  useEffect(() => {
    if (!removed) return
    const timer = window.setTimeout(() => setRemoved(null), UNDO_TIMEOUT)
    return () => window.clearTimeout(timer)
  }, [removed])

  // Горячие клавиши: «/» — к полю ввода, Ctrl/⌘+Z — вернуть удалённую задачу
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
      if (isTyping) return
      if (event.key === '/') {
        event.preventDefault()
        inputRef.current?.focus()
      } else if (event.key.toLowerCase() === 'z' && (event.metaKey || event.ctrlKey) && removed) {
        event.preventDefault()
        handleUndo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleUndo, removed])

  const progress = counts.all === 0 ? 0 : counts.completed / counts.all

  return (
    <div className="layout">
      <div className="rail">
      <header className="masthead">
        <p className="masthead__date">{today}</p>
        <h1 className="masthead__title">Задачи</h1>
        <p className="masthead__summary">
          {counts.all === 0
            ? 'Здесь пока пусто'
            : `Выполнено ${counts.completed} из ${counts.all} ${plural(counts.all, ['задачи', 'задач', 'задач'])}`}
        </p>
        <div
          className="progress"
          role="progressbar"
          aria-label="Доля выполненных задач"
          aria-valuemin={0}
          aria-valuemax={Math.max(counts.all, 1)}
          aria-valuenow={counts.completed}
        >
          <div className="progress__bar" style={{ transform: `scaleX(${progress})` }} />
        </div>
      </header>

      <aside className="sidebar">
        <FilterTabs value={filter} counts={counts} onChange={setFilter} />
        {counts.completed > 0 && (
          <button type="button" className="button button--ghost sidebar__clear" onClick={clearCompleted}>
            Удалить выполненные ({counts.completed})
          </button>
        )}
        <p className="sidebar__hint">
          <kbd>/</kbd> новая задача, двойной клик по тексту — изменить
        </p>
      </aside>
      </div>

      <main className="board">
        <TodoForm onAdd={add} inputRef={inputRef} />

        {visible.length > 0 ? (
          <ul className="todo-list" aria-label={`Задачи: ${visible.length}`}>
            {visible.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onToggle={toggle} onRename={rename} onRemove={handleRemove} />
            ))}
          </ul>
        ) : (
          <p className="empty">{EMPTY_TEXT[filter]}</p>
        )}
      </main>

      <footer className="footer">
        Тестовое задание для ZalogHub.{' '}
        <a href="https://github.com/nonncal/zaloghub-todo">Исходный код на GitHub</a>
      </footer>

      <UndoToast title={removed?.todo.title ?? null} onUndo={handleUndo} />
    </div>
  )
}
