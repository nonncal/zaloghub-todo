import { memo, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { Todo } from '../types'
import { CheckIcon, PencilIcon, TrashIcon } from './Icons'
import { MAX_TITLE_LENGTH } from './TodoForm'
import { normalizeTitle } from '../lib/todos'

interface Props {
  todo: Todo
  onToggle: (id: string) => void
  onRename: (id: string, title: string) => void
  onRemove: (id: string) => void
}

const stampDate = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })

export const TodoItem = memo(function TodoItem({ todo, onToggle, onRename, onRemove }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.title)
  // Штамп «ставится» с анимацией только по действию пользователя, а не при загрузке страницы
  const [stampAnimated, setStampAnimated] = useState(false)
  const editRef = useRef<HTMLInputElement>(null)
  const editButtonRef = useRef<HTMLButtonElement>(null)
  // Защита от двойного завершения: Escape размонтирует поле, и браузер следом шлёт blur
  const editingRef = useRef(false)

  useEffect(() => {
    if (editing) editRef.current?.select()
  }, [editing])

  const startEditing = () => {
    setDraft(todo.title)
    editingRef.current = true
    setEditing(true)
  }

  const finishEditing = (save: boolean) => {
    if (!editingRef.current) return
    editingRef.current = false
    setEditing(false)
    if (save && normalizeTitle(draft) && normalizeTitle(draft) !== todo.title) {
      onRename(todo.id, draft)
    }
    requestAnimationFrame(() => editButtonRef.current?.focus())
  }

  const handleEditKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') finishEditing(true)
    if (event.key === 'Escape') finishEditing(false)
  }

  const checkboxId = `todo-${todo.id}`

  return (
    <li className={`todo${todo.completed ? ' todo--done' : ''}`}>
      <input
        id={checkboxId}
        className="todo__checkbox visually-hidden"
        type="checkbox"
        checked={todo.completed}
        onChange={() => {
          setStampAnimated(!todo.completed)
          onToggle(todo.id)
        }}
      />
      <label className="todo__check" htmlFor={checkboxId}>
        <CheckIcon />
        <span className="visually-hidden">
          {todo.completed ? 'Вернуть в работу' : 'Отметить выполненной'}: {todo.title}
        </span>
      </label>

      {editing ? (
        <input
          ref={editRef}
          className="todo__edit"
          value={draft}
          maxLength={MAX_TITLE_LENGTH}
          aria-label="Текст задачи"
          enterKeyHint="done"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleEditKey}
          onBlur={() => finishEditing(true)}
        />
      ) : (
        <span className="todo__title" onDoubleClick={startEditing}>
          {todo.title}
        </span>
      )}

      {todo.completed && todo.completedAt !== undefined && !editing && (
        <span className={`stamp${stampAnimated ? ' stamp--animated' : ''}`} aria-hidden="true">
          <span className="stamp__label">Выполнено</span>
          <span className="stamp__date">{stampDate.format(todo.completedAt)}</span>
        </span>
      )}

      {!editing && (
        <div className="todo__actions">
          <button
            ref={editButtonRef}
            className="icon-button"
            type="button"
            onClick={startEditing}
            aria-label={`Изменить задачу: ${todo.title}`}
            title="Изменить"
          >
            <PencilIcon />
          </button>
          <button
            className="icon-button icon-button--danger"
            type="button"
            onClick={() => onRemove(todo.id)}
            aria-label={`Удалить задачу: ${todo.title}`}
            title="Удалить"
          >
            <TrashIcon />
          </button>
        </div>
      )}
    </li>
  )
})
