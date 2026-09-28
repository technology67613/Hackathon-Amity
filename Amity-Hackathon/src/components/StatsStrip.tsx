interface StatsStripProps {
  total: number
  totalMatches: number
  recovered: number
}

export function StatsStrip({ total, totalMatches, recovered }: StatsStripProps) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <StatPill label="Reported" value={total} color="#5B7BFA" />
      <StatPill label="Possible Matches" value={totalMatches} color="#F5B942" />
      <StatPill label="Recovered" value={recovered} color="#16A34A" />
    </div>
  )
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'rgba(255,255,255,0.65)',
      border: '1px solid rgba(255,255,255,0.75)',
      borderRadius: 50, padding: '6px 16px',
      boxShadow: '0 4px 16px rgba(80,120,200,0.08)',
    }}>
      <span style={{ fontWeight: 800, fontSize: 18, color }}>{value}</span>
      <span style={{ fontSize: 12, color: '#4A5B7A' }}>{label}</span>
    </div>
  )
}
