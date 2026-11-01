import type { Todo } from '../types'
import { nextNumber } from './todos'

export const STORAGE_KEY = 'zaloghub.todos.v1'

type StoredTodo = Omit<Todo, 'number'> & { number?: number }

function isTodo(value: unknown): value is StoredTodo {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.title === 'string' &&
    v.title.trim().length > 0 &&
    (v.number === undefined || (Number.isInteger(v.number) && (v.number as number) > 0)) &&
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
    return Array.isArray(data) ? withNumbers(data.filter(isTodo)) : []
  } catch {
    return []
  }
}

/** Записи без номера (из старой версии) получают номера по порядку создания */
function withNumbers(stored: StoredTodo[]): Todo[] {
  const numbered = stored.filter((t): t is Todo => t.number !== undefined)
  let next = nextNumber(numbered)
  const missing = new Map(
    stored
      .filter((t) => t.number === undefined)
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((t) => [t, next++] as const),
  )
  return stored.map((t) => (t.number === undefined ? { ...t, number: missing.get(t)! } : (t as Todo)))
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
