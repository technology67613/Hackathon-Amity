export function Skeleton() {
  return (
    <div className="glass" style={{ borderRadius: 20, padding: 16, display: 'flex', gap: 14 }}>
      <div className="shimmer" style={{ width: 96, height: 96, borderRadius: 12, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="shimmer" style={{ height: 16, borderRadius: 8, width: '70%' }} />
        <div className="shimmer" style={{ height: 12, borderRadius: 8, width: '40%' }} />
        <div className="shimmer" style={{ height: 12, borderRadius: 8, width: '55%' }} />
        <div className="shimmer" style={{ height: 12, borderRadius: 8, width: '45%' }} />
        <div className="shimmer" style={{ height: 36, borderRadius: 10, marginTop: 4 }} />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="card-grid">
      {Array.from({ length: count }).map((_, i) => <Skeleton key={i} />)}
    </div>
  )
}
