import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { STORAGE_KEY, loadTodos, parseTodos, saveTodos } from '../lib/storage'
import { todosReducer } from '../lib/todos'
import type { Todo } from '../types'

export function useTodos() {
  const [todos, dispatch] = useReducer(todosReducer, undefined, loadTodos)

  useEffect(() => {
    saveTodos(todos)
  }, [todos])

  // Синхронизация между вкладками: изменения из другой вкладки сразу видны здесь
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        dispatch({ type: 'replace', todos: parseTodos(event.newValue) })
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const actions = useMemo(
    () => ({
      add: (title: string) =>
        dispatch({ type: 'add', title, id: crypto.randomUUID(), createdAt: Date.now() }),
      toggle: (id: string) => dispatch({ type: 'toggle', id, at: Date.now() }),
      rename: (id: string, title: string) => dispatch({ type: 'rename', id, title }),
      remove: (id: string) => dispatch({ type: 'remove', id }),
      restore: (todo: Todo, index: number) => dispatch({ type: 'restore', todo, index }),
      clearCompleted: () => dispatch({ type: 'clearCompleted' }),
    }),
    [],
  )

  const findIndex = useCallback((id: string) => todos.findIndex((t) => t.id === id), [todos])

  return { todos, findIndex, ...actions }
}
