import { useNavigate } from 'react-router-dom'
import { PlusCircle, Search, RefreshCw } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  showReport?: boolean
  showRetry?: boolean
  onRetry?: () => void
  query?: string
}

export function EmptyState({ title, description, showReport, showRetry, onRetry, query }: EmptyStateProps) {
  const navigate = useNavigate()
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: '#4A5B7A' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
      <h3 style={{ color: '#0F2A5C', fontWeight: 700, fontSize: 18, margin: '0 0 8px' }}>{title}</h3>
      {description && <p style={{ margin: '0 0 20px', fontSize: 14 }}>{description}</p>}
      {query && <p style={{ margin: '0 0 20px', fontSize: 14 }}>No matches for <strong>"{query}"</strong>. Try fewer words or Clear All.</p>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {showReport && (
          <button className="btn-primary" onClick={() => navigate('/report')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <PlusCircle size={16} /> Report Item
          </button>
        )}
        {showRetry && onRetry && (
          <button className="btn-outline" onClick={onRetry} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={16} /> Retry
          </button>
        )}
        <button className="btn-outline" onClick={() => navigate('/search')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Search size={16} /> Browse All
        </button>
      </div>
    </div>
  )
}
