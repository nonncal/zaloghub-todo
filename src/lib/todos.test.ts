import { describe, expect, it } from 'vitest'
import type { Todo } from '../types'
import { filterTodos, normalizeTitle, todosReducer } from './todos'

const todo = (id: string, completed = false, number = 1): Todo => ({
  id,
  number,
  title: `Задача ${id}`,
  completed,
  createdAt: 0,
})

describe('normalizeTitle', () => {
  it('обрезает и схлопывает пробелы', () => {
    expect(normalizeTitle('  купить   хлеб \n')).toBe('купить хлеб')
  })
})

describe('todosReducer', () => {
  it('добавляет задачу в начало списка', () => {
    const state = todosReducer([todo('a')], { type: 'add', title: ' Новая ', id: 'b', createdAt: 1 })
    expect(state.map((t) => t.id)).toEqual(['b', 'a'])
    expect(state[0].title).toBe('Новая')
  })

  it('выдаёт следующий номер, даже если ранние задачи удалены', () => {
    const state = todosReducer([todo('a', false, 7)], { type: 'add', title: 'Новая', id: 'b', createdAt: 1 })
    expect(state[0].number).toBe(8)
  })

  it.each(['', '   ', '\t\n'])('не добавляет пустую задачу %j', (title) => {
    const state = [todo('a')]
    expect(todosReducer(state, { type: 'add', title, id: 'b', createdAt: 1 })).toBe(state)
  })

  it('переключает выполнение и запоминает время', () => {
    const done = todosReducer([todo('a')], { type: 'toggle', id: 'a', at: 42 })
    expect(done[0]).toMatchObject({ completed: true, completedAt: 42 })
    const undone = todosReducer(done, { type: 'toggle', id: 'a', at: 50 })
    expect(undone[0]).toMatchObject({ completed: false, completedAt: undefined })
  })

  it('не переименовывает в пустую строку', () => {
    const state = [todo('a')]
    expect(todosReducer(state, { type: 'rename', id: 'a', title: '  ' })).toBe(state)
  })

  it('возвращает удалённую задачу на прежнее место', () => {
    const initial = [todo('a'), todo('b'), todo('c')]
    const removed = todosReducer(initial, { type: 'remove', id: 'b' })
    expect(todosReducer(removed, { type: 'restore', todo: initial[1], index: 1 })).toEqual(initial)
  })

  it('удаляет все выполненные', () => {
    const state = todosReducer([todo('a', true), todo('b')], { type: 'clearCompleted' })
    expect(state.map((t) => t.id)).toEqual(['b'])
  })
})

describe('filterTodos', () => {
  const list = [todo('a'), todo('b', true)]
  it.each([
    ['all', ['a', 'b']],
    ['active', ['a']],
    ['completed', ['b']],
  ] as const)('%s', (filter, ids) => {
    expect(filterTodos(list, filter).map((t) => t.id)).toEqual(ids)
  })
})
