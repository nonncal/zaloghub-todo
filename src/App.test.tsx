import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { STORAGE_KEY } from './lib/storage'

const setup = () => {
  const user = userEvent.setup()
  const utils = render(<App />)
  const input = screen.getByRole('textbox', { name: 'Новая задача' })
  const addTodo = async (text: string) => {
    await user.type(input, text)
    await user.click(screen.getByRole('button', { name: 'Добавить' }))
  }
  const items = () => within(screen.getByRole('list')).getAllByRole('listitem')
  return { user, input, addTodo, items, ...utils }
}

describe('App', () => {
  it('добавляет задачу и очищает поле', async () => {
    const { input, addTodo, items } = setup()
    await addTodo('Проверить договор')
    expect(items()).toHaveLength(1)
    expect(screen.getByText('Проверить договор')).toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('добавляет задачу по Enter', async () => {
    const { user, input, items } = setup()
    await user.type(input, 'Позвонить клиенту{Enter}')
    expect(items()).toHaveLength(1)
  })

  it('не добавляет задачу из пробелов и показывает подсказку', async () => {
    const { addTodo } = setup()
    await addTodo('    ')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('пустую строку')
  })

  it('переключает выполнение', async () => {
    const { user, addTodo, items } = setup()
    await addTodo('Задача')
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
    expect(items()[0]).toHaveClass('todo--done')
    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('удаляет задачу и позволяет вернуть её', async () => {
    const { user, addTodo } = setup()
    await addTodo('Удалить меня')
    await user.click(screen.getByRole('button', { name: 'Удалить задачу: Удалить меня' }))
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Вернуть' }))
    expect(screen.getByText('Удалить меня')).toBeInTheDocument()
  })

  it('фильтрует задачи', async () => {
    const { user, addTodo, items } = setup()
    await addTodo('Первая')
    await addTodo('Вторая')
    await user.click(screen.getByRole('checkbox', { name: /Первая/ }))

    await user.click(screen.getByRole('button', { name: /Активные/ }))
    expect(items().map((li) => li.textContent)).toEqual([expect.stringContaining('Вторая')])

    await user.click(screen.getByRole('button', { name: /Выполненные/ }))
    expect(items().map((li) => li.textContent)).toEqual([expect.stringContaining('Первая')])

    await user.click(screen.getByRole('button', { name: /Все/ }))
    expect(items()).toHaveLength(2)
  })

  it('редактирует задачу двойным кликом', async () => {
    const { user, addTodo } = setup()
    await addTodo('Черновик')
    await user.dblClick(screen.getByText('Черновик'))
    const edit = screen.getByRole('textbox', { name: 'Текст задачи' })
    await user.clear(edit)
    await user.type(edit, 'Чистовик{Enter}')
    expect(screen.getByText('Чистовик')).toBeInTheDocument()
  })

  it('Escape отменяет редактирование', async () => {
    const { user, addTodo } = setup()
    await addTodo('Оригинал')
    await user.dblClick(screen.getByText('Оригинал'))
    await user.type(screen.getByRole('textbox', { name: 'Текст задачи' }), ' изменён{Escape}')
    expect(screen.getByText('Оригинал')).toBeInTheDocument()
  })

  it('сохраняет задачи после перезагрузки', async () => {
    const { user, addTodo, unmount } = setup()
    await addTodo('Не потеряться')
    await user.click(screen.getByRole('checkbox'))
    unmount()

    render(<App />)
    expect(screen.getByText('Не потеряться')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeChecked()
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toHaveLength(1)
  })

  it('подхватывает изменения из другой вкладки', () => {
    render(<App />)
    const todos = [{ id: 'x', title: 'Из другой вкладки', completed: false, createdAt: 1 }]
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: JSON.stringify(todos) }))
    })
    expect(screen.getByText('Из другой вкладки')).toBeInTheDocument()
  })
})
