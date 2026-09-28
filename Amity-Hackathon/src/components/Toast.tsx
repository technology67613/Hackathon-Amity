import { useToast } from '../context/ToastContext'
import { CheckCircle2, XCircle } from 'lucide-react'

export function Toast() {
  const { toasts } = useToast()
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center',
      pointerEvents: 'none', width: 'max-content', maxWidth: 'calc(100vw - 32px)',
    }}>
      {toasts.map(t => (
        <div key={t.id} className="glass" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 20px', borderRadius: 50,
          animation: 'toast-in 0.3s ease',
          background: t.type === 'success' ? 'rgba(22,163,74,0.1)' : 'rgba(229,72,77,0.1)',
          border: `1px solid ${t.type === 'success' ? 'rgba(22,163,74,0.3)' : 'rgba(229,72,77,0.3)'}`,
        }}>
          {t.type === 'success'
            ? <CheckCircle2 size={18} color="#16A34A" />
            : <XCircle size={18} color="#E5484D" />
          }
          <span style={{ fontSize: 14, fontWeight: 600, color: t.type === 'success' ? '#16A34A' : '#E5484D' }}>
            {t.message}
          </span>
        </div>
      ))}
    </div>
  )
}
