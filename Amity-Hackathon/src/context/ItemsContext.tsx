import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Item, Match } from '../types'
import { fetchItems } from '../lib/api'
import { getMatches, countMatchedItems } from '../lib/match'

interface ItemsContextValue {
  items: Item[]
  loading: boolean
  error: string | null
  refresh: () => void
  addLocal: (item: Item) => void
  markReturnedLocal: (id: string) => void
  matchesFor: (id: string) => Match[]
  totalMatches: number
  recoveredCount: number
}

const ItemsContext = createContext<ItemsContextValue | null>(null)

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchItems()
      .then(data => { setItems(data); setLoading(false) })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load items')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    load()
    const handleFocus = () => load()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [load])

  const addLocal = useCallback((item: Item) => {
    setItems(prev => [item, ...prev])
  }, [])

  const markReturnedLocal = useCallback((id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, returned: true } : i))
  }, [])

  const matchesMap = useMemo(() => {
    const map = new Map<string, Match[]>()
    for (const item of items) {
      const matches = getMatches(item, items)
      if (matches.length > 0) map.set(item.id, matches)
    }
    return map
  }, [items])

  const matchesFor = useCallback((id: string): Match[] => {
    return matchesMap.get(id) ?? []
  }, [matchesMap])

  const totalMatches = useMemo(() => countMatchedItems(items), [items])
  const recoveredCount = useMemo(() => items.filter(i => i.returned).length, [items])

  return (
    <ItemsContext.Provider value={{ items, loading, error, refresh: load, addLocal, markReturnedLocal, matchesFor, totalMatches, recoveredCount }}>
      {children}
    </ItemsContext.Provider>
  )
}

export function useItems(): ItemsContextValue {
  const ctx = useContext(ItemsContext)
  if (!ctx) throw new Error('useItems must be used within ItemsProvider')
  return ctx
}
