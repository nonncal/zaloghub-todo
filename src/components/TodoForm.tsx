import { useId, useState, type FormEvent, type RefObject } from 'react'
import { normalizeTitle } from '../lib/todos'

interface Props {
  onAdd: (title: string) => void
  inputRef: RefObject<HTMLInputElement | null>
}

export const MAX_TITLE_LENGTH = 200

export function TodoForm({ onAdd, inputRef }: Props) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const errorId = useId()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!normalizeTitle(value)) {
      setError(true)
      inputRef.current?.focus()
      return
    }
    onAdd(value)
    setValue('')
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit} noValidate>
      <div className="todo-form__row">
        <label className="visually-hidden" htmlFor="new-todo">
          Новая задача
        </label>
        <input
          ref={inputRef}
          id="new-todo"
          className="todo-form__input"
          type="text"
          value={value}
          maxLength={MAX_TITLE_LENGTH}
          placeholder="Что нужно сделать?"
          autoComplete="off"
          enterKeyHint="done"
          aria-invalid={error}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => {
            setValue(e.target.value)
            if (error) setError(false)
          }}
        />
        <button className="button button--primary" type="submit">
          Добавить
        </button>
      </div>
      {error && (
        <p className="todo-form__error" id={errorId} role="alert">
          Напишите текст задачи — пустую строку или одни пробелы добавить нельзя.
        </p>
      )}
    </form>
  )
}
