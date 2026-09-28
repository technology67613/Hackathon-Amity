import type { Item } from '../types'

interface StatusPillProps {
  type: Item['type']
  size?: 'sm' | 'md'
}

export function StatusPill({ type, size = 'md' }: StatusPillProps) {
  const isLost = type === 'lost'
  const base = size === 'sm'
    ? 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold'
    : 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold'

  return (
    <span className={base} style={{
      color: isLost ? '#E5484D' : '#16A34A',
      background: isLost ? '#FDE8EC' : '#E3F7EC',
    }}>
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{
        background: isLost ? '#E5484D' : '#16A34A',
      }} />
      {isLost ? 'Lost' : 'Found'}
    </span>
  )
}
