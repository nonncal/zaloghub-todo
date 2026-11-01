import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FilterTabs } from './components/FilterTabs'
import { TodoForm } from './components/TodoForm'
import { TodoItem } from './components/TodoItem'
import { UndoToast } from './components/UndoToast'
import { useHashFilter } from './hooks/useHashFilter'
import { useTodos } from './hooks/useTodos'
import { filterTodos } from './lib/todos'
import type { Filter, Todo } from './types'

const UNDO_TIMEOUT = 6000

const EMPTY_TEXT: Record<Filter, { title: string; text?: string }> = {
  all: { title: 'Задач пока нет', text: 'Добавленные задачи сохранятся в браузере и останутся после перезагрузки' },
  active: { title: 'Активных задач нет' },
  completed: { title: 'Выполненных задач нет' },
}

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

  const empty = EMPTY_TEXT[filter]

  return (
    <div className="page">
      <header className="head">
        <h1 className="head__title">Задачи</h1>
        <FilterTabs value={filter} counts={counts} onChange={setFilter} />
      </header>

      <main className="sheet">
        <TodoForm onAdd={add} inputRef={inputRef} />

        {visible.length > 0 ? (
          <ul className="todo-list" aria-label={`Задачи: ${visible.length}`}>
            {visible.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onToggle={toggle} onRename={rename} onRemove={handleRemove} />
            ))}
          </ul>
        ) : (
          <div className="empty">
            <p className="empty__title">{empty.title}</p>
            {empty.text && <p className="empty__text">{empty.text}</p>}
          </div>
        )}

        {counts.all > 0 && (
          <div className="tally">
            <p className="tally__text">
              Выполнено {counts.completed} из {counts.all}
            </p>
            <div
              className="tally__bar"
              role="progressbar"
              aria-label="Доля выполненных задач"
              aria-valuemin={0}
              aria-valuemax={counts.all}
              aria-valuenow={counts.completed}
            >
              <div className="tally__fill" style={{ transform: `scaleX(${counts.completed / counts.all})` }} />
            </div>
            {counts.completed > 0 && (
              <button type="button" className="text-button" onClick={clearCompleted}>
                Удалить выполненные
              </button>
            )}
          </div>
        )}
      </main>

      <footer className="foot">
        <p className="foot__keys">
          <span>
            <kbd>/</kbd> новая задача
          </span>
          <span>двойной клик по тексту — изменить</span>
        </p>
        <p>
          Тестовое задание для ZalogHub, <a href="https://github.com/nonncal/zaloghub-todo">код на GitHub</a>
        </p>
      </footer>

      <UndoToast title={removed?.todo.title ?? null} onUndo={handleUndo} />
    </div>
  )
}
