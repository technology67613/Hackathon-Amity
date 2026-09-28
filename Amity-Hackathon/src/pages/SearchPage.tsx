import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useItems } from '../context/ItemsContext'
import { useFilters } from '../hooks/useFilters'
import { useDebounce } from '../hooks/useDebounce'
import { ItemCard } from '../components/ItemCard'
import { SkeletonGrid } from '../components/Skeleton'
import { EmptyState } from '../components/EmptyState'
import { ClaimModal } from '../components/ClaimModal'
import type { Item, Category, Priority } from '../types'
import { priorityOf } from '../lib/priority'
import { expandQuery } from '../lib/synonyms'
import { tokenize } from '../lib/synonyms'

const CATEGORIES: Category[] = ['Electronics', 'Documents', 'Accessories', 'Books', 'Bags', 'Other']
const PRIORITIES: Priority[] = ['high', 'medium', 'low']

function matchesQuery(item: Item, words: string[]): boolean {
  if (words.length === 0) return true
  const fields = `${item.name} ${item.description ?? ''} ${item.category} ${item.location}`.toLowerCase()
  const fieldTokens = tokenize(fields)
  // Check each word: must match somewhere in name/desc/cat/loc after synonym expansion
  return words.every(word => {
    if (fields.includes(word)) return true
    for (const token of fieldTokens) if (token === word || token.includes(word) || word.includes(token)) return true
    return false
  })
}

function filterAndSort(items: Item[], filters: ReturnType<typeof useFilters>[0], debouncedQ: string): Item[] {
  const words = expandQuery(debouncedQ)

  return items
    .filter(item => {
      if (filters.status && item.type !== filters.status) return false
      if (filters.category && item.category !== filters.category) return false
      if (filters.priority && priorityOf(item.category) !== filters.priority) return false
      if (filters.location && item.location.toLowerCase() !== filters.location.toLowerCase()) return false
      if (filters.range) {
        const d = new Date(item.date).getTime()
        const now = Date.now()
        if (filters.range === 'today' && now - d > 86400000) return false
        if (filters.range === '7days' && now - d > 7 * 86400000) return false
        if (filters.range === '30days' && now - d > 30 * 86400000) return false
      }
      if (!matchesQuery(item, words)) return false
      return true
    })
    .sort((a, b) => {
      if (filters.sort === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
}

export function SearchPage() {
  const navigate = useNavigate()
  const { items, loading, error } = useItems()
  const [filters, updateFilters] = useFilters()
  const [localQ, setLocalQ] = useState(filters.q)
  const debouncedQ = useDebounce(localQ, 250)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [claimItem, setClaimItem] = useState<Item | null>(null)

  const locations = useMemo(() => [...new Set(items.map(i => i.location))].sort(), [items])

  const results = useMemo(
    () => filterAndSort(items, { ...filters, q: debouncedQ }, debouncedQ),
    [items, filters, debouncedQ]
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ q: localQ })
  }

  const clearAll = () => {
    setLocalQ('')
    updateFilters({ status: '', category: '', priority: '', location: '', range: '', sort: 'newest', q: '' })
  }

  const filterPanel = (
    <div className="glass" style={{ borderRadius: 20, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontWeight: 700, color: '#0F2A5C', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <SlidersHorizontal size={18} color="#5B7BFA" /> Filters
        </span>
        <button onClick={clearAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5B7BFA', fontSize: 13, fontWeight: 600 }}>
          Clear All
        </button>
      </div>

      <FilterSection label="Status">
        <div style={{ display: 'flex', gap: 6 }}>
          {['', 'lost', 'found'].map(s => (
            <button
              key={s}
              onClick={() => updateFilters({ status: s })}
              style={{
                flex: 1, padding: '7px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                ...(filters.status === s
                  ? { background: 'linear-gradient(135deg, #7C9CFF, #5B7BFA)', color: 'white' }
                  : { background: '#F0F4FF', color: '#4A5B7A' }
                ),
              }}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Category">
        <select
          id="filter-category"
          value={filters.category}
          onChange={e => updateFilters({ category: e.target.value })}
          style={selectStyle}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </FilterSection>

      <FilterSection label="Priority">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {([['', 'All'], ...PRIORITIES.map(p => [p, p.charAt(0).toUpperCase() + p.slice(1)])] as [string, string][]).map(([val, label]) => (
            <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#4A5B7A' }}>
              <input
                type="radio"
                name="priority"
                value={val}
                checked={filters.priority === val}
                onChange={() => updateFilters({ priority: val })}
                style={{ accentColor: '#5B7BFA' }}
              />
              {label}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Location">
        <select
          id="filter-location"
          value={filters.location}
          onChange={e => updateFilters({ location: e.target.value })}
          style={selectStyle}
        >
          <option value="">All Locations</option>
          {locations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </FilterSection>

      <FilterSection label="Date Range">
        <select
          id="filter-range"
          value={filters.range}
          onChange={e => updateFilters({ range: e.target.value })}
          style={selectStyle}
        >
          <option value="">Any Date</option>
          <option value="today">Today</option>
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
        </select>
      </FilterSection>

      <button
        className="btn-primary"
        onClick={() => setFilterDrawerOpen(false)}
        style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
      >
        Apply Filters
      </button>
    </div>
  )

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px 48px' }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontWeight: 800, fontSize: 24, color: '#0F2A5C', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Search size={22} color="#5B7BFA" /> Search &amp; Filters
        </h1>
        <p style={{ color: '#4A5B7A', fontSize: 14, margin: '0 0 4px' }}>
          Find lost items or help someone get their belongings back.
        </p>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: '#4A5B7A' }}>
          Search. Filter. Reunite. ♡
        </span>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Results panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Search bar row */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
              <Search size={17} color="#8A9BB8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="search-input"
                type="search"
                value={localQ}
                onChange={e => setLocalQ(e.target.value)}
                placeholder="Search lost or found items..."
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '12px 40px 12px 42px', borderRadius: 12,
                  border: '1.5px solid #DCE6F7', fontSize: 14, color: '#0F2A5C',
                  background: 'rgba(255,255,255,0.85)', outline: 'none', fontFamily: 'inherit',
                }}
              />
              {localQ && (
                <button type="button" onClick={() => { setLocalQ(''); updateFilters({ q: '' }) }} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                  <X size={16} color="#8A9BB8" />
                </button>
              )}
            </div>
            <select
              value={filters.status}
              onChange={e => updateFilters({ status: e.target.value })}
              style={{ ...selectStyle, minWidth: 130 }}
            >
              <option value="">All Status</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
            <select
              value={filters.category}
              onChange={e => updateFilters({ category: e.target.value })}
              style={{ ...selectStyle, minWidth: 150 }}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              type="button"
              className="btn-outline"
              onClick={() => setFilterDrawerOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <SlidersHorizontal size={16} />
              <span className="hide-mobile">Filters</span>
            </button>
          </form>

          {/* Results header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontWeight: 700, color: '#0F2A5C', fontSize: 15 }}>
              Search Results ({loading ? '...' : results.length} items)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#8A9BB8' }}>Sort by:</span>
              <select
                value={filters.sort}
                onChange={e => updateFilters({ sort: e.target.value })}
                style={{ ...selectStyle, padding: '6px 12px' }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Mobile filter drawer */}
          {filterDrawerOpen && (
            <div style={{ marginBottom: 16 }}>
              {filterPanel}
            </div>
          )}

          {loading && <SkeletonGrid count={6} />}
          {error && <EmptyState title="Could not load items" description={error} />}
          {!loading && !error && results.length === 0 && (
            <EmptyState
              title="No results found"
              query={debouncedQ || undefined}
              showReport
            />
          )}
          {!loading && !error && results.length > 0 && (
            <div className="card-grid-2">
              {results.map((item, idx) => (
                <div key={item.id} style={{ animation: `fadeUp 0.4s ease ${idx * 40}ms both` }}>
                  <ItemCard item={item} onActionClick={setClaimItem} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right filter panel - desktop only */}
        <aside className="hide-mobile" style={{ width: 260, flexShrink: 0, position: 'sticky', top: 92 }}>
          {filterPanel}
        </aside>
      </div>

      {claimItem && (
        <ClaimModal
          item={claimItem}
          onClose={() => setClaimItem(null)}
          onUnlock={() => {
            setClaimItem(null)
            navigate(`/item/${claimItem.id}`)
          }}
        />
      )}
    </main>
  )
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontWeight: 600, color: '#0F2A5C', fontSize: 13, marginBottom: 10 }}>{label}</label>
      {children}
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  padding: '10px 12px', borderRadius: 10, border: '1.5px solid #DCE6F7',
  fontSize: 13, color: '#0F2A5C', background: 'rgba(255,255,255,0.85)',
  outline: 'none', cursor: 'pointer', fontFamily: 'inherit', appearance: 'none',
  width: '100%', boxSizing: 'border-box',
}
