import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Tag, Phone, Mail, Lock, Unlock, Heart, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import { useItems } from '../context/ItemsContext'
import { useToast } from '../context/ToastContext'
import { StatusPill } from '../components/StatusPill'
import { ItemThumb } from '../components/ItemThumb'
import { ItemCard } from '../components/ItemCard'
import { ClaimModal } from '../components/ClaimModal'
import { fmtLong, fmtShort } from '../lib/format'
import { parseContact, telHref, mailHref } from '../lib/contact'
import { getMine, isSaved, addToSaved, removeFromSaved } from '../lib/storage'
import { markReturned } from '../lib/api'

function MatchRingSmall({ score }: { score: number }) {
  const r = 18
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <svg width={44} height={44} style={{ flexShrink: 0 }}>
      <circle cx={22} cy={22} r={r} fill="none" stroke="#F0F4FF" strokeWidth={4} />
      <circle cx={22} cy={22} r={r} fill="none" stroke="#F5B942" strokeWidth={4}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 22 22)" style={{ transition: 'stroke-dasharray 0.7s ease' }} />
      <text x={22} y={26} textAnchor="middle" fontSize={10} fontWeight={700} fill="#C88B00">{score}%</text>
    </svg>
  )
}

export function ItemDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { items, matchesFor, markReturnedLocal } = useItems()
  const { showToast } = useToast()
  const [unlockedContact, setUnlockedContact] = useState<string | null>(null)
  const [claimOpen, setClaimOpen] = useState(false)
  const [saved, setSaved] = useState(() => isSaved(id ?? ''))
  const [marking, setMarking] = useState(false)

  const item = items.find(i => i.id === id)

  if (!item && items.length > 0) {
    return (
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <h1 style={{ color: '#0F2A5C', fontWeight: 800, fontSize: 22, margin: '0 0 12px' }}>This listing isn't available</h1>
        <button className="btn-primary" onClick={() => navigate('/')}>Back to Listings</button>
      </main>
    )
  }

  if (!item) return null

  const matches = matchesFor(item.id)
  const myIds = getMine()
  const isOwner = myIds.includes(item.id)
  const canMark = isOwner || !!unlockedContact
  const contact = parseContact(unlockedContact ?? '')
  const maskedContact = unlockedContact ? null : { phones: ['98••••••10'], emails: [] }

  const handleSave = () => {
    if (saved) { removeFromSaved(id!); setSaved(false) }
    else { addToSaved(id!); setSaved(true) }
  }

  const handleMarkReturned = async () => {
    if (!canMark || marking) return
    setMarking(true)
    try {
      await markReturned(id!)
      markReturnedLocal(id!)
      showToast('Marked as recovered!', 'success')
    } catch {
      showToast('Failed to mark as recovered', 'error')
    } finally {
      setMarking(false)
    }
  }

  const moreItems = items
    .filter(i => i.id !== id && !i.returned)
    .sort((a, b) => {
      if (a.category === item.category && b.category !== item.category) return -1
      if (b.category === item.category && a.category !== item.category) return 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    .slice(0, 4)

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 16px 48px' }}>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 13, color: '#8A9BB8' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5B7BFA', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, padding: 0, fontSize: 13 }}>
          <ArrowLeft size={15} /> Back to Listings
        </button>
        <span>›</span>
        <span>Item Details</span>
      </nav>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Main card */}
        <div style={{ flex: 2, minWidth: 280 }}>
          <div className="glass" style={{ borderRadius: 24, padding: '28px', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <ItemThumb item={item} size={160} />
                <button
                  onClick={handleSave}
                  style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%',
                    width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                  aria-label={saved ? 'Remove from saved' : 'Save item'}
                >
                  <Heart size={18} color={saved ? '#E5484D' : '#8A9BB8'} fill={saved ? '#E5484D' : 'none'} />
                </button>
              </div>

              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ marginBottom: 10 }}>
                  <StatusPill type={item.type} />
                </div>
                <h1 style={{ fontWeight: 800, fontSize: 22, color: '#0F2A5C', margin: '0 0 16px' }}>{item.name}</h1>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  <DetailRow icon={<Tag size={16} color="#5B7BFA" />} label="Category" value={item.category} />
                  <DetailRow icon={<MapPin size={16} color="#5B7BFA" />} label="Location" value={item.location} />
                  <DetailRow icon={<Calendar size={16} color="#5B7BFA" />} label="Date" value={fmtLong(item.date)} />
                </div>

                <p style={{ color: '#4A5B7A', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
                  {item.description}
                </p>

                {/* Additional Info box */}
                <div style={{
                  background: 'rgba(91,123,250,0.06)', borderRadius: 12,
                  border: '1px solid rgba(91,123,250,0.2)', padding: '12px 16px',
                }}>
                  <p style={{ margin: 0, fontSize: 13, color: '#4A5B7A', lineHeight: 1.5 }}>
                    <AlertCircle size={14} color="#5B7BFA" style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
                    {item.type === 'lost'
                      ? "This item was lost on campus. If you've found it, answer one question to contact the owner."
                      : "This item was found on campus. If it's yours, answer one question to contact the finder."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Possible Matches */}
          {matches.length > 0 && !item.returned && (
            <div className="glass" style={{ borderRadius: 24, padding: '24px', marginBottom: 20 }}>
              <h2 style={{ fontWeight: 800, color: '#0F2A5C', fontSize: 18, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                🎯 Possible Matches
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {matches.slice(0, 3).map(({ item: matchItem, score }) => (
                  <div key={matchItem.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(245,185,66,0.06)', borderRadius: 14, border: '1px solid rgba(245,185,66,0.2)' }}>
                    <ItemThumb item={matchItem} size={52} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, color: '#0F2A5C', fontSize: 14 }}>{matchItem.name}</span>
                        <StatusPill type={matchItem.type} size="sm" />
                      </div>
                      <span style={{ fontSize: 12, color: '#4A5B7A' }}>{matchItem.location} · {fmtShort(matchItem.date)}</span>
                    </div>
                    <MatchRingSmall score={score} />
                    <button
                      className="btn-outline"
                      onClick={() => navigate(`/item/${matchItem.id}`)}
                      style={{ flexShrink: 0, padding: '7px 14px', fontSize: 13 }}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* More Items */}
          {moreItems.length > 0 && (
            <div className="glass" style={{ borderRadius: 24, padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontWeight: 800, color: '#0F2A5C', fontSize: 18, margin: 0 }}>More Items from Campus</h2>
                <button
                  onClick={() => navigate('/search')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5B7BFA', fontWeight: 600, fontSize: 13 }}
                >
                  View All →
                </button>
              </div>
              <div className="card-grid-2">
                {moreItems.map(i => (
                  <ItemCard key={i.id} item={i} onActionClick={() => navigate(`/item/${i.id}`)} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <aside style={{ width: 280, flexShrink: 0 }}>
          {/* Contact card */}
          <div className="glass" style={{ borderRadius: 20, padding: '24px', marginBottom: 16 }}>
            <h2 style={{ fontWeight: 800, color: '#0F2A5C', fontSize: 16, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              {unlockedContact ? <Unlock size={18} color="#F5B942" /> : <Lock size={18} color="#5B7BFA" />}
              {item.type === 'lost' ? 'Contact Owner' : 'Contact Finder'}
            </h2>

            {item.returned && (
              <div style={{ textAlign: 'center', padding: '16px 0', color: '#16A34A' }}>
                <CheckCircle2 size={32} style={{ marginBottom: 8 }} />
                <p style={{ fontWeight: 700, margin: 0 }}>Already Recovered</p>
              </div>
            )}

            {!item.returned && !unlockedContact && (
              <>
                {/* Masked contact */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  <ContactRow
                    icon={<Phone size={15} color="#8A9BB8" />}
                    value={maskedContact!.phones[0] ?? '+91 ••• •••••••'}
                    disabled
                  />
                  <ContactRow
                    icon={<Mail size={15} color="#8A9BB8" />}
                    value={maskedContact!.emails[0] ?? '••••@••••.•••'}
                    disabled
                  />
                </div>
                <p style={{ fontSize: 12, color: '#8A9BB8', marginBottom: 16, textAlign: 'center' }}>
                  Answer 1 question to unlock contact details.
                </p>
                <button
                  className="btn-primary"
                  onClick={() => setClaimOpen(true)}
                  style={{ width: '100%', justifyContent: 'center' }}
                  id="btn-claim"
                >
                  {item.type === 'lost' ? 'I Found This' : 'Contact Finder'}
                </button>
              </>
            )}

            {!item.returned && unlockedContact && (
              <>
                <div style={{ background: 'rgba(245,185,66,0.08)', borderRadius: 12, border: '1px solid rgba(245,185,66,0.3)', padding: '10px 14px', marginBottom: 14 }}>
                  <p style={{ margin: 0, fontSize: 12, color: '#C88B00', fontWeight: 600 }}>🔓 Contact unlocked for this session</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {contact.phones.map(phone => (
                    <div key={phone} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <ContactRow icon={<Phone size={15} color="#5B7BFA" />} value={phone} />
                      <a href={telHref(phone)} className="btn-primary" style={{ padding: '8px 14px', fontSize: 12, textDecoration: 'none', flexShrink: 0 }}>
                        Call
                      </a>
                    </div>
                  ))}
                  {contact.emails.map(email => (
                    <div key={email} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <ContactRow icon={<Mail size={15} color="#5B7BFA" />} value={email} />
                      <a href={mailHref(email, item.name)} className="btn-outline" style={{ padding: '8px 14px', fontSize: 12, textDecoration: 'none', flexShrink: 0 }}>
                        Email
                      </a>
                    </div>
                  ))}
                </div>

                {/* Primary action button */}
                {contact.phones[0] ? (
                  <a href={telHref(contact.phones[0])} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', textDecoration: 'none', marginBottom: 10, boxSizing: 'border-box' }}>
                    <Phone size={16} />
                    {item.type === 'lost' ? 'Contact Owner' : 'Contact Finder'}
                  </a>
                ) : contact.emails[0] ? (
                  <a href={mailHref(contact.emails[0], item.name)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', textDecoration: 'none', marginBottom: 10, boxSizing: 'border-box' }}>
                    <Mail size={16} />
                    {item.type === 'lost' ? 'Contact Owner' : 'Contact Finder'}
                  </a>
                ) : null}

                {contact.phones[0] && contact.emails[0] && (
                  <>
                    <div style={{ textAlign: 'center', color: '#8A9BB8', fontSize: 12, margin: '8px 0' }}>— OR —</div>
                    <a href={mailHref(contact.emails[0], item.name)} className="btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', textDecoration: 'none', boxSizing: 'border-box' }}>
                      <Mail size={16} />
                      Send Email
                    </a>
                  </>
                )}
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="glass" style={{ borderRadius: 20, padding: '20px 20px' }}>
            <h3 style={{ fontWeight: 700, color: '#0F2A5C', fontSize: 14, margin: '0 0 14px' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <button
                  onClick={handleMarkReturned}
                  disabled={!canMark || item.returned || marking}
                  className="btn-outline"
                  style={{
                    width: '100%', justifyContent: 'center',
                    opacity: (!canMark || item.returned) ? 0.5 : 1,
                    cursor: (!canMark || item.returned) ? 'not-allowed' : 'pointer',
                  }}
                  title={canMark ? undefined : 'Only the person who reported this can mark it.'}
                  id="btn-mark-returned"
                >
                  <CheckCircle2 size={16} />
                  {item.type === 'lost' ? 'Mark as Found' : 'Mark as Returned'}
                </button>
                <p style={{ fontSize: 11, color: '#8A9BB8', margin: '4px 0 0', textAlign: 'center' }}>
                  {item.type === 'lost' ? '(if you are the owner)' : '(if you are the finder)'}
                </p>
              </div>
              <div>
                <button
                  className="btn-outline"
                  onClick={() => navigate('/report', { state: { category: item.category, location: item.location } })}
                  style={{ width: '100%', justifyContent: 'center' }}
                  id="btn-report-similar"
                >
                  Report Similar Item
                </button>
                <p style={{ fontSize: 11, color: '#8A9BB8', margin: '4px 0 0', textAlign: 'center' }}>
                  if you found something else
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {claimOpen && (
        <ClaimModal
          item={item}
          onClose={() => setClaimOpen(false)}
          onUnlock={(contactStr) => {
            setUnlockedContact(contactStr)
            setClaimOpen(false)
          }}
        />
      )}
    </main>
  )
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {icon}
      <span style={{ fontSize: 13, color: '#8A9BB8', minWidth: 72 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#0F2A5C', fontWeight: 600 }}>{value}</span>
    </div>
  )
}

function ContactRow({ icon, value, disabled }: { icon: React.ReactNode; value: string; disabled?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      flex: 1, minWidth: 0,
      padding: '8px 12px', borderRadius: 10,
      background: disabled ? '#F4F6FB' : 'rgba(91,123,250,0.06)',
      border: `1px solid ${disabled ? '#DCE6F7' : 'rgba(91,123,250,0.2)'}`,
    }}>
      {icon}
      <span style={{ fontSize: 13, color: disabled ? '#8A9BB8' : '#0F2A5C', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}
      </span>
      {disabled && <Lock size={12} color="#8A9BB8" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
    </div>
  )
}
