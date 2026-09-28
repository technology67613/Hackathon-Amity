import { useNavigate } from 'react-router-dom'
import { Tag, MapPin, Calendar, Phone, Mail, CheckCircle2 } from 'lucide-react'
import type { Item } from '../types'
import { StatusPill } from './StatusPill'
import { ItemThumb } from './ItemThumb'
import { fmtShort } from '../lib/format'
import { useItems } from '../context/ItemsContext'

interface ItemCardProps {
  item: Item
  onActionClick?: (item: Item) => void
  pulse?: boolean
}

export function ItemCard({ item, onActionClick, pulse = false }: ItemCardProps) {
  const navigate = useNavigate()
  const { matchesFor } = useItems()
  const matches = matchesFor(item.id)

  const handleCardClick = () => navigate(`/item/${item.id}`)
  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!item.returned && onActionClick) onActionClick(item)
  }

  const actionLabel = item.type === 'lost' ? 'I Found This' : 'Contact Finder'

  return (
    <div
      className={`card glass cursor-pointer${pulse ? ' new-pulse' : ''}`}
      style={{ borderRadius: 20, padding: '16px', display: 'flex', gap: 14, position: 'relative', overflow: 'hidden' }}
      onClick={handleCardClick}
      role="article"
      aria-label={`${item.type === 'lost' ? 'Lost' : 'Found'}: ${item.name}`}
    >
      {item.returned && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: '#16A34A', color: 'white',
          padding: '4px 10px', fontSize: 11, fontWeight: 600,
          borderBottomLeftRadius: 10,
        }}>
          ✅ Recovered
        </div>
      )}

      <ItemThumb item={item} size={96} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
          <h3 style={{
            fontWeight: 700, fontSize: 15, color: '#0F2A5C',
            margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {item.name}
          </h3>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {matches.length > 0 && !item.returned && (
              <span style={{
                background: '#FFF4DA', color: '#C88B00', fontSize: 11, fontWeight: 600,
                padding: '2px 8px', borderRadius: 20,
              }}>
                🎯 {matches.length} match{matches.length !== 1 ? 'es' : ''}
              </span>
            )}
            <StatusPill type={item.type} size="sm" />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 8 }}>
          <MetaRow icon={<Tag size={13} color="#5B7BFA" />} text={item.category} />
          <MetaRow icon={<MapPin size={13} color="#5B7BFA" />} text={item.location} />
          <MetaRow icon={<Calendar size={13} color="#5B7BFA" />} text={fmtShort(item.date)} />
        </div>

        <p style={{
          fontSize: 13, color: '#4A5B7A', margin: '0 0 10px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {item.description}
        </p>

        {item.returned ? (
          <button
            disabled
            className="btn-outline"
            style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <CheckCircle2 size={15} />
            Already Recovered
          </button>
        ) : (
          <button
            className="btn-outline"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            onClick={handleAction}
            id={`card-action-${item.id}`}
          >
            {item.type === 'lost' ? <Phone size={15} /> : <Mail size={15} />}
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}

function MetaRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#4A5B7A' }}>
      {icon}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</span>
    </span>
  )
}
