import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Item, Match } from '../types'
import { ItemThumb } from './ItemThumb'
import { StatusPill } from './StatusPill'
import { fmtShort } from '../lib/format'

interface MatchPanelProps {
  newItem: Item
  matches: Match[]
  onSkip: () => void
}

function MatchRing({ score }: { score: number }) {
  const r = 22
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ

  return (
    <svg width={54} height={54} style={{ flexShrink: 0 }}>
      <circle cx={27} cy={27} r={r} fill="none" stroke="#F0F4FF" strokeWidth={5} />
      <circle
        cx={27} cy={27} r={r} fill="none"
        stroke="#F5B942" strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 27 27)"
        style={{ transition: 'stroke-dasharray 0.7s ease' }}
      />
      <text x={27} y={31} textAnchor="middle" fontSize={11} fontWeight={700} fill="#C88B00">
        {score}%
      </text>
    </svg>
  )
}

export function MatchPanel({ newItem, matches, onSkip }: MatchPanelProps) {
  const navigate = useNavigate()

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onSkip() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onSkip])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1100,
      background: 'rgba(15,42,92,0.4)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div className="glass modal-in" style={{ width: '100%', maxWidth: 560, padding: 36, borderRadius: 28 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🎯</div>
          <h2 style={{ color: '#0F2A5C', fontWeight: 800, fontSize: 22, margin: '0 0 6px' }}>
            We found {matches.length} possible match{matches.length !== 1 ? 'es' : ''}!
          </h2>
          <p style={{ color: '#4A5B7A', fontSize: 14, margin: 0 }}>
            Someone may already have reported this.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {matches.slice(0, 3).map(({ item: matchItem, score }) => (
            <div key={matchItem.id} className="glass" style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', borderRadius: 16,
            }}>
              <ItemThumb item={matchItem} size={56} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: '#0F2A5C', fontSize: 15 }}>{matchItem.name}</span>
                  <StatusPill type={matchItem.type} size="sm" />
                </div>
                <span style={{ fontSize: 12, color: '#4A5B7A' }}>
                  {matchItem.location} · {fmtShort(matchItem.date)}
                </span>
              </div>
              <MatchRing score={score} />
              <button
                onClick={() => { onSkip(); navigate(`/item/${matchItem.id}`) }}
                className="btn-primary"
                style={{ flexShrink: 0, padding: '8px 16px', fontSize: 13 }}
              >
                View
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => { onSkip(); navigate(`/item/${newItem.id}`) }}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            View My Listing
          </button>
          <button onClick={onSkip} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#8A9BB8', fontSize: 13, padding: 8,
          }}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
