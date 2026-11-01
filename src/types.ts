export interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: number
  /** Когда задачу отметили выполненной — используется в штампе */
  completedAt?: number
}

export type Filter = 'all' | 'active' | 'completed'

export const FILTERS: readonly Filter[] = ['all', 'active', 'completed']
