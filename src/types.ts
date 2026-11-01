export interface Todo {
  id: string
  /** Порядковый номер в журнале: не меняется при удалении других задач */
  number: number
  title: string
  completed: boolean
  createdAt: number
  /** Когда задачу отметили выполненной — показывается рядом с задачей */
  completedAt?: number
}

export type Filter = 'all' | 'active' | 'completed'

export const FILTERS: readonly Filter[] = ['all', 'active', 'completed']
