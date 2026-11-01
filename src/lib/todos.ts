import type { Filter, Todo } from '../types'

export type TodoAction =
  | { type: 'add'; title: string; id: string; createdAt: number }
  | { type: 'toggle'; id: string; at: number }
  | { type: 'rename'; id: string; title: string }
  | { type: 'remove'; id: string }
  | { type: 'restore'; todo: Todo; index: number }
  | { type: 'clearCompleted' }
  | { type: 'replace'; todos: Todo[] }

export function nextNumber(todos: Todo[]): number {
  return todos.reduce((max, t) => Math.max(max, t.number), 0) + 1
}

/** Убирает пробелы по краям и схлопывает повторяющиеся внутри. */
export function normalizeTitle(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ')
}

export function todosReducer(state: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case 'add': {
      const title = normalizeTitle(action.title)
      if (!title) return state
      return [
        { id: action.id, number: nextNumber(state), title, completed: false, createdAt: action.createdAt },
        ...state,
      ]
    }
    case 'toggle':
      return state.map((t) =>
        t.id === action.id
          ? { ...t, completed: !t.completed, completedAt: t.completed ? undefined : action.at }
          : t,
      )
    case 'rename': {
      const title = normalizeTitle(action.title)
      if (!title) return state
      return state.map((t) => (t.id === action.id ? { ...t, title } : t))
    }
    case 'remove':
      return state.filter((t) => t.id !== action.id)
    case 'restore': {
      if (state.some((t) => t.id === action.todo.id)) return state
      const next = [...state]
      next.splice(Math.min(action.index, next.length), 0, action.todo)
      return next
    }
    case 'clearCompleted':
      return state.filter((t) => !t.completed)
    case 'replace':
      return action.todos
  }
}

export function filterTodos(todos: Todo[], filter: Filter): Todo[] {
  switch (filter) {
    case 'active':
      return todos.filter((t) => !t.completed)
    case 'completed':
      return todos.filter((t) => t.completed)
    case 'all':
      return todos
  }
}
