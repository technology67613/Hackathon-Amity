import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FileText, ArrowRight } from 'lucide-react'
import { useItems } from '../context/ItemsContext'
import { ItemCard } from '../components/ItemCard'
import { SkeletonGrid } from '../components/Skeleton'
import { EmptyState } from '../components/EmptyState'
import { StatsStrip } from '../components/StatsStrip'
import { ClaimModal } from '../components/ClaimModal'
import type { Item } from '../types'
import heroImg from '../assets/hero.png'

type StatusFilter = 'all' | 'lost' | 'found'

export function HomePage() {
  const navigate = useNavigate()
  const { items, loading, error, refresh, totalMatches, recoveredCount } = useItems()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [claimItem, setClaimItem] = useState<Item | null>(null)
  const location = useLocation()
  const newItemId = (location.state as { newItemId?: string } | null)?.newItemId ?? null

  const filtered = items
    .filter(i => statusFilter === 'all' || i.type === statusFilter)
    .slice(0, 8)

  return (
    <main>
      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '48px 24px 32px', maxWidth: 1280, margin: '0 auto' }}>
        <img
          src={heroImg}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: 0.08, zIndex: 0,
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)',
          }}
        />

        {/* Blobs */}
        <div aria-hidden="true" style={{ position: 'absolute', top: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(124,156,255,0.18)', filter: 'blur(60px)', zIndex: 0 }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: -40, right: -40, width: 250, height: 250, borderRadius: '50%', background: 'rgba(91,123,250,0.12)', filter: 'blur(50px)', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <h1 style={{
              fontWeight: 800, fontSize: 'clamp(28px, 5vw, 44px)',
              color: '#0F2A5C', margin: '0 0 10px', lineHeight: 1.15,
            }}>
              Lost something?<br />Found something?
            </h1>
            <p style={{ color: '#4A5B7A', fontSize: 16, margin: 0, maxWidth: 400 }}>
              Help your campus community get back what matters.
            </p>
          </div>
          <div style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 28, color: '#4A5B7A',
            transform: 'rotate(-3deg)',
            userSelect: 'none',
          }}>
            Small things make a<br />big difference ♡
            <div style={{
              marginTop: 4, height: 2, borderRadius: 2,
              background: 'linear-gradient(90deg, #5B7BFA, transparent)',
            }} />
          </div>
        </div>
      </section>

      {/* Listings panel */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 48px' }}>
        {/* Chips + Stats row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['all', 'lost', 'found'] as StatusFilter[]).map(s => (
              <button
                key={s}
                id={`chip-${s}`}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '8px 18px', borderRadius: 50, fontSize: 13, fontWeight: 600,
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 6,
                  ...(statusFilter === s
                    ? { background: 'linear-gradient(135deg, #7C9CFF, #5B7BFA)', color: 'white', boxShadow: '0 4px 14px rgba(91,123,250,0.35)' }
                    : { background: 'rgba(255,255,255,0.7)', color: '#4A5B7A', border: '1px solid rgba(255,255,255,0.75)' }
                  ),
                }}
              >
                {s !== 'all' && (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: s === 'lost' ? '#E5484D' : '#16A34A', display: 'inline-block' }} />
                )}
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <StatsStrip total={items.length} totalMatches={totalMatches} recovered={recoveredCount} />
        </div>

        <div className="glass" style={{ borderRadius: 24, padding: '28px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontWeight: 800, color: '#0F2A5C', fontSize: 20, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={20} color="#5B7BFA" />
              Recent Listings
            </h2>
            <button
              onClick={() => navigate('/search')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5B7BFA', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              View all <ArrowRight size={16} />
            </button>
          </div>

          {loading && <SkeletonGrid count={8} />}
          {error && <EmptyState title="Could not load items" description={error} showRetry onRetry={refresh} />}
          {!loading && !error && filtered.length === 0 && (
            <EmptyState title="Nothing here yet. Be the first to report." showReport />
          )}
          {!loading && !error && filtered.length > 0 && (
            <div className="card-grid">
              {filtered.map((item, idx) => (
                <div key={item.id} style={{ animation: `fadeUp 0.4s ease ${idx * 40}ms both` }}>
                  <ItemCard
                    item={item}
                    onActionClick={setClaimItem}
                    pulse={item.id === newItemId}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {claimItem && (
        <ClaimModal
          item={claimItem}
          onClose={() => setClaimItem(null)}
          onUnlock={() => {
            setClaimItem(null)
            // Navigate to the item to see unlocked contact
          }}
        />
      )}
    </main>
  )
}
