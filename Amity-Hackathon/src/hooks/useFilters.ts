import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

export interface Filters {
  q: string
  status: string
  category: string
  priority: string
  location: string
  range: string
  sort: string
}

export function useFilters(): [Filters, (updates: Partial<Filters>) => void] {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters: Filters = {
    q: searchParams.get('q') ?? '',
    status: searchParams.get('status') ?? '',
    category: searchParams.get('category') ?? '',
    priority: searchParams.get('priority') ?? '',
    location: searchParams.get('location') ?? '',
    range: searchParams.get('range') ?? '',
    sort: searchParams.get('sort') ?? 'newest',
  }

  const updateFilters = useCallback((updates: Partial<Filters>) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      for (const [key, value] of Object.entries(updates)) {
        if (value) next.set(key, value)
        else next.delete(key)
      }
      return next
    })
  }, [setSearchParams])

  return [filters, updateFilters]
}
