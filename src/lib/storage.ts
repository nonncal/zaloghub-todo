import type { Todo } from '../types'

export const STORAGE_KEY = 'zaloghub.todos.v1'

function isTodo(value: unknown): value is Todo {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.title === 'string' &&
    v.title.trim().length > 0 &&
    typeof v.completed === 'boolean' &&
    typeof v.createdAt === 'number' &&
    (v.completedAt === undefined || typeof v.completedAt === 'number')
  )
}

/**
 * Разбирает сохранённое значение. Повреждённые или чужие данные
 * не роняют приложение: битые записи отбрасываются.
 */
export function parseTodos(raw: string | null): Todo[] {
  if (!raw) return []
  try {
    const data: unknown = JSON.parse(raw)
    return Array.isArray(data) ? data.filter(isTodo) : []
  } catch {
    return []
  }
}

export function loadTodos(): Todo[] {
  try {
    return parseTodos(localStorage.getItem(STORAGE_KEY))
  } catch {
    // Safari в приватном режиме и запрет cookies могут бросать исключение
    return []
  }
}

export function saveTodos(todos: Todo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  } catch {
    // Переполнение квоты или недоступное хранилище — приложение продолжает работать в памяти
  }
}
