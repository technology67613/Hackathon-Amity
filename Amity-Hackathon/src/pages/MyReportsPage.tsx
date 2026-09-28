import { useState, useMemo } from 'react'
import { useItems } from '../context/ItemsContext'
import { ItemCard } from '../components/ItemCard'
import { Sidebar } from '../components/Sidebar'
import { EmptyState } from '../components/EmptyState'
import { SkeletonGrid } from '../components/Skeleton'
import { ClaimModal } from '../components/ClaimModal'
import { getMine } from '../lib/storage'
import type { Item } from '../types'

type Tab = 'all' | 'lost' | 'found'

export function MyReportsPage() {
  const { items, loading, matchesFor } = useItems()
  const [tab, setTab] = useState<Tab>('all')
  const [claimItem, setClaimItem] = useState<Item | null>(null)
  const myIds = useMemo(() => getMine(), [])

  const myItems = useMemo(
    () => items
      .filter(i => myIds.includes(i.id))
      .filter(i => tab === 'all' || i.type === tab)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [items, myIds, tab]
  )

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px 48px' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div className="hide-mobile">
          <Sidebar activeRoute="/my-reports" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="glass" style={{ borderRadius: 24, padding: '28px 24px' }}>
            <h1 style={{ fontWeight: 800, fontSize: 22, color: '#0F2A5C', margin: '0 0 6px' }}>
              My Reports
            </h1>
            <p style={{ color: '#8A9BB8', fontSize: 13, margin: '0 0 20px' }}>
              Items reported from this device. Data is device-local since there's no login.
            </p>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {(['all', 'lost', 'found'] as Tab[]).map(t => (
                <button
                  key={t}
                  id={`tab-${t}`}
                  onClick={() => setTab(t)}
                  style={{
                    padding: '7px 18px', borderRadius: 50, border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
                    ...(tab === t
                      ? { background: 'linear-gradient(135deg, #7C9CFF, #5B7BFA)', color: 'white' }
                      : { background: '#F0F4FF', color: '#4A5B7A' }
                    ),
                  }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {loading && <SkeletonGrid count={4} />}
            {!loading && myItems.length === 0 && (
              <EmptyState
                title={myIds.length === 0 ? "You haven't reported anything on this device yet." : `No ${tab} items found.`}
                showReport={myIds.length === 0}
              />
            )}
            {!loading && myItems.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {myItems.map(item => {
                  const matches = matchesFor(item.id)
                  return (
                    <div key={item.id}>
                      <ItemCard item={item} onActionClick={setClaimItem} />
                      {matches.length > 0 && (
                        <p style={{ fontSize: 12, color: '#F5B942', fontWeight: 600, margin: '4px 0 0 8px' }}>
                          🎯 Possible matches: {matches.length}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {claimItem && (
        <ClaimModal
          item={claimItem}
          onClose={() => setClaimItem(null)}
          onUnlock={() => setClaimItem(null)}
        />
      )}
    </main>
  )
}
