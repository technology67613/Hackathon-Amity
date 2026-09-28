import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, PlusCircle, X, User } from 'lucide-react'
import { useItems } from '../context/ItemsContext'
import { getMine } from '../lib/storage'

interface HeaderProps {
  searchValue?: string
  onSearchChange?: (v: string) => void
}

export function Header({ searchValue = '', onSearchChange }: HeaderProps) {
  const navigate = useNavigate()
  const { items, matchesFor } = useItems()
  const [q, setQ] = useState(searchValue)
  const [bellOpen, setBellOpen] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setQ(searchValue) }, [searchValue])

  // Bell alerts: my reported items that have matches
  const myIds = getMine()
  const alerts = myIds
    .map(id => ({ id, item: items.find(i => i.id === id), matches: matchesFor(id) }))
    .filter(a => a.item && a.matches.length > 0)
  const alertCount = alerts.length

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  // Close bell on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.72)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.75)',
      boxShadow: '0 4px 24px rgba(80,120,200,0.08)',
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        height: 72, display: 'flex', alignItems: 'center', gap: 16,
      }}>
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
          aria-label="Home"
        >
          <span style={{ fontSize: 26 }}>🎒</span>
          <span style={{
            fontWeight: 800, fontSize: 18, color: '#0F2A5C',
            display: 'none',
          }} className="logo-text">
            Campus Lost &amp; Found
          </span>
        </button>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 480 }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            background: 'rgba(255,255,255,0.85)',
            border: '1.5px solid #DCE6F7',
            borderRadius: 50, padding: '0 16px',
            gap: 8,
          }}>
            <Search size={17} color="#8A9BB8" />
            <input
              type="search"
              id="global-search"
              value={q}
              onChange={e => {
                setQ(e.target.value)
                onSearchChange?.(e.target.value)
              }}
              placeholder="Search lost or found items..."
              style={{
                flex: 1, border: 'none', background: 'transparent',
                padding: '10px 0', fontSize: 14, color: '#0F2A5C', outline: 'none',
              }}
            />
            {q && (
              <button type="button" onClick={() => { setQ(''); onSearchChange?.('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                <X size={15} color="#8A9BB8" />
              </button>
            )}
          </div>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
          {/* Report Item button */}
          <button
            id="btn-report-item"
            onClick={() => navigate('/report')}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
          >
            <PlusCircle size={16} />
            <span className="hide-mobile">Report Item</span>
          </button>

          {/* Bell */}
          <div ref={bellRef} style={{ position: 'relative' }}>
            <button
              id="btn-bell"
              onClick={() => setBellOpen(o => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, position: 'relative', display: 'flex' }}
              aria-label={`${alertCount} match alerts`}
            >
              <Bell size={22} color="#4A5B7A" />
              {alertCount > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 4,
                  background: '#E5484D', color: 'white',
                  fontSize: 10, fontWeight: 700, width: 16, height: 16,
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {alertCount}
                </span>
              )}
            </button>

            {bellOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 44, width: 300,
                background: 'rgba(255,255,255,0.98)', borderRadius: 16,
                boxShadow: '0 16px 48px rgba(80,120,200,0.18)',
                border: '1px solid rgba(255,255,255,0.75)',
                overflow: 'hidden', zIndex: 200,
              }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #EEF2FB', fontWeight: 700, color: '#0F2A5C', fontSize: 14 }}>
                  Match Alerts
                </div>
                {alerts.length === 0 ? (
                  <p style={{ padding: 16, color: '#8A9BB8', fontSize: 13, margin: 0 }}>
                    No new matches yet. We check whenever you open the app.
                  </p>
                ) : (
                  alerts.slice(0, 5).map(({ id, item: myItem, matches }) => {
                    const topMatch = matches[0]
                    return (
                      <button
                        key={id}
                        onClick={() => { navigate(`/item/${topMatch.item.id}`); setBellOpen(false) }}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left',
                          padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer',
                          borderBottom: '1px solid #F4F6FB', fontSize: 13, color: '#4A5B7A',
                        }}
                      >
                        Your {myItem?.type} <strong style={{ color: '#0F2A5C' }}>{myItem?.name}</strong> may match a {topMatch.item.type} <strong style={{ color: '#0F2A5C' }}>{topMatch.item.name}</strong>{' '}
                        <span style={{ color: '#F5B942', fontWeight: 700 }}>({topMatch.score}%)</span>
                      </button>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {/* Avatar */}
          <button
            id="btn-avatar"
            onClick={() => navigate('/my-reports')}
            style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7C9CFF, #5B7BFA)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer', color: 'white', fontWeight: 700, fontSize: 15,
            }}
            aria-label="My Reports"
          >
            <User size={18} color="white" />
          </button>
        </div>
      </div>
    </header>
  )
}
