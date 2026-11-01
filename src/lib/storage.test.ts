import { describe, expect, it } from 'vitest'
import { parseTodos } from './storage'

describe('parseTodos', () => {
  it('возвращает пустой список для пустого и битого значения', () => {
    expect(parseTodos(null)).toEqual([])
    expect(parseTodos('{не json')).toEqual([])
    expect(parseTodos('{"a":1}')).toEqual([])
  })

  it('отбрасывает некорректные записи', () => {
    const valid = { id: '1', number: 1, title: 'Задача', completed: false, createdAt: 1 }
    const raw = JSON.stringify([valid, { id: 2 }, null, { ...valid, id: '3', title: '   ' }])
    expect(parseTodos(raw)).toEqual([valid])
  })

  it('нумерует записи без номера по времени создания', () => {
    const raw = JSON.stringify([
      { id: 'new', title: 'Новая', completed: false, createdAt: 20 },
      { id: 'old', title: 'Старая', completed: false, createdAt: 10 },
      { id: 'n', number: 4, title: 'С номером', completed: true, createdAt: 5 },
    ])
    expect(parseTodos(raw).map((t) => [t.id, t.number])).toEqual([
      ['new', 6],
      ['old', 5],
      ['n', 4],
    ])
  })
})
