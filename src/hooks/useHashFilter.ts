import { useCallback, useSyncExternalStore } from 'react'
import { FILTERS, type Filter } from '../types'

function readFilter(): Filter {
  const value = window.location.hash.replace(/^#\/?/, '')
  return (FILTERS as readonly string[]).includes(value) ? (value as Filter) : 'all'
}

function subscribe(callback: () => void) {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

/**
 * Фильтр живёт в адресе (#/active, #/completed): ссылкой можно поделиться,
 * а кнопка «Назад» в браузере возвращает предыдущий фильтр.
 */
export function useHashFilter() {
  const filter = useSyncExternalStore(subscribe, readFilter, () => 'all' as Filter)

  const setFilter = useCallback((next: Filter) => {
    window.location.hash = next === 'all' ? '/' : `/${next}`
  }, [])

  return [filter, setFilter] as const
}
