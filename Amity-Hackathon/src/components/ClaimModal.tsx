import { useEffect, useRef } from 'react'
import { X, Lock, Unlock, CheckCircle2 } from 'lucide-react'
import { useItems } from '../context/ItemsContext'
import type { Item } from '../types'
import { claimItem } from '../lib/api'
import { getAttempts, incrementAttempts } from '../lib/storage'
import { useState } from 'react'

interface ClaimModalProps {
  item: Item
  onClose: () => void
  onUnlock: (contact: string) => void
}

const MAX_ATTEMPTS = 3

export function ClaimModal({ item, onClose, onUnlock }: ClaimModalProps) {
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(() => getAttempts(item.id))
  const [shake, setShake] = useState(false)
  const [success, setSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { markReturnedLocal: _markReturnedLocal } = useItems()

  useEffect(() => {
    inputRef.current?.focus()
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const locked = attempts >= MAX_ATTEMPTS

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!answer.trim() || locked) return
    setLoading(true)
    setError('')
    try {
      const contact = await claimItem(item.id, answer.trim())
      if (contact) {
        setSuccess(true)
        setTimeout(() => { onUnlock(contact) }, 900)
      } else {
        const newAttempts = incrementAttempts(item.id)
        setAttempts(newAttempts)
        setShake(true)
        setTimeout(() => setShake(false), 500)
        if (newAttempts >= MAX_ATTEMPTS) {
          setError('Too many tries. Please try again later.')
        } else {
          setError(`Not quite. Try again. (${MAX_ATTEMPTS - newAttempts} left)`)
        }
        setAnswer('')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,42,92,0.35)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Claim Verification"
    >
      <div className="glass modal-in" style={{ width: '100%', maxWidth: 420, padding: 32, borderRadius: 24 }}>
        {/* Lock icon */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          {success ? (
            <div style={{ animation: 'goldBurst 0.6s ease' }}>
              <Unlock size={44} color="#F5B942" />
            </div>
          ) : (
            <Lock size={44} color={locked ? '#E5484D' : '#5B7BFA'} />
          )}
        </div>

        <h2 style={{ textAlign: 'center', color: '#0F2A5C', fontWeight: 800, fontSize: 20, margin: '0 0 6px' }}>
          {success ? '🎉 Contact Unlocked!' : 'Verify it\'s you'}
        </h2>
        <p style={{ textAlign: 'center', color: '#4A5B7A', fontSize: 13, margin: '0 0 20px' }}>
          {item.name}
        </p>

        {!success && (
          <>
            <div style={{
              background: 'rgba(91,123,250,0.08)', borderRadius: 12,
              padding: '12px 16px', marginBottom: 20,
              border: '1px solid rgba(91,123,250,0.2)',
            }}>
              <p style={{ margin: 0, color: '#0F2A5C', fontWeight: 600, fontSize: 14 }}>
                {item.question}
              </p>
            </div>

            <form onSubmit={handleVerify}>
              <div className={shake ? 'shake' : ''}>
                <input
                  ref={inputRef}
                  type="text"
                  id="claim-answer"
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="Your answer..."
                  disabled={locked || loading}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '12px 14px', borderRadius: 12,
                    border: `1.5px solid ${error ? '#E5484D' : '#DCE6F7'}`,
                    fontSize: 14, color: '#0F2A5C', background: 'rgba(255,255,255,0.85)',
                    outline: 'none', marginBottom: 10,
                  }}
                />
              </div>

              {error && (
                <p style={{ color: '#E5484D', fontSize: 13, margin: '0 0 10px', textAlign: 'center' }}>
                  {error}
                </p>
              )}

              {/* Attempt dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                  <span key={i} style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: i < attempts ? '#E5484D' : '#DCE6F7',
                    transition: 'background 0.3s',
                  }} />
                ))}
              </div>

              <button
                type="submit"
                disabled={locked || loading || !answer.trim()}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', opacity: (locked || !answer.trim()) ? 0.6 : 1 }}
              >
                {loading ? (
                  <span className="spinner" />
                ) : (
                  locked ? 'Locked' : 'Verify'
                )}
              </button>
            </form>
          </>
        )}

        {success && (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle2 size={36} color="#16A34A" style={{ marginBottom: 8 }} />
            <p style={{ color: '#16A34A', fontWeight: 600, fontSize: 15 }}>
              Contact details unlocked!
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex',
          }}
          aria-label="Close modal"
        >
          <X size={20} color="#8A9BB8" />
        </button>
      </div>
    </div>
  )
}
