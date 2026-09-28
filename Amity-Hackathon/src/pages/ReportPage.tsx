import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Tag, MapPin, Calendar, Phone, FileText, Lock, Lightbulb, Send } from 'lucide-react'
import { Sidebar } from '../components/Sidebar'
import { useItems } from '../context/ItemsContext'
import { useToast } from '../context/ToastContext'
import { reportItem } from '../lib/api'
import { addToMine } from '../lib/storage'
import { getMatches } from '../lib/match'
import { MatchPanel } from '../components/MatchPanel'
import type { Item, ItemType, Category, ReportInput } from '../types'

const CATEGORIES: Category[] = ['Electronics', 'Documents', 'Accessories', 'Books', 'Bags', 'Other']
const LOCATIONS = ['Library', 'Block A', 'Block B', 'Canteen', 'Main Gate', 'Gym', 'Hostel', 'Ground', 'Parking', 'Auditorium']
const QUESTION_CHIPS = ["What colour or brand is it?", "What's inside it?", "What's written or stuck on it?", "Any scratch or unique mark?"]

interface LocationState { category?: Category; location?: string }

function validateContact(contact: string): boolean {
  const parts = contact.split(',').map(s => s.trim()).filter(Boolean)
  if (parts.length === 0) return false
  return parts.every(p => {
    if (p.includes('@')) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p)
    return /^[+0-9][0-9\s\-]{9,18}$/.test(p)
  })
}

export function ReportPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as LocationState | null
  const { addLocal, items } = useItems()
  const { showToast } = useToast()

  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState<ReportInput>({
    type: 'lost',
    name: '',
    category: locationState?.category ?? '' as Category,
    location: locationState?.location ?? '',
    date: today,
    description: '',
    contact: '',
    question: '',
    answer: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ReportInput, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [matchPanel, setMatchPanel] = useState<{ item: Item; matches: ReturnType<typeof getMatches> } | null>(null)

  const set = (key: keyof ReportInput, value: string) => {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  const validate = (): boolean => {
    const errs: Partial<Record<keyof ReportInput, string>> = {}
    if (!form.name.trim() || form.name.length < 2) errs.name = 'Item name must be 2–60 characters'
    if (!form.category) errs.category = 'Please select a category'
    if (!form.location.trim() || form.location.length < 2) errs.location = 'Location must be 2–40 characters'
    if (!form.date) errs.date = 'Date is required'
    if (!form.description.trim() || form.description.length < 5) errs.description = 'Description must be at least 5 characters'
    if (form.description.length > 200) errs.description = 'Description must be under 200 characters'
    if (!validateContact(form.contact)) errs.contact = 'Enter a valid phone number, email, or both separated by comma'
    if (!form.question.trim()) errs.question = 'Please enter a verification question'
    if (!form.answer.trim()) errs.answer = 'Please enter a verification answer'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const id = crypto.randomUUID()
      await reportItem({ ...form, id })
      addToMine(id)
      const newItem: Item = {
        id, type: form.type, name: form.name, category: form.category,
        location: form.location, date: form.date, description: form.description,
        question: form.question, returned: false,
        created_at: new Date().toISOString(),
      }
      addLocal(newItem)
      showToast('Listing submitted!', 'success')

      // Run Smart Match on all items
      const allItems = [newItem, ...items]
      const matches = getMatches(newItem, allItems)
      if (matches.length > 0) {
        setMatchPanel({ item: newItem, matches })
      } else {
        navigate('/', { state: { newItemId: id } })
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to submit. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box' as const,
    padding: '11px 14px 11px 40px', borderRadius: 12,
    border: '1.5px solid #DCE6F7', fontSize: 14, color: '#0F2A5C',
    background: 'rgba(255,255,255,0.85)', outline: 'none',
    fontFamily: 'inherit',
  }

  const labelStyle = {
    display: 'block', fontWeight: 600, fontSize: 13, color: '#0F2A5C', marginBottom: 6,
  }

  const errorStyle = { color: '#E5484D', fontSize: 12, marginTop: 4 }

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px 48px' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Sidebar – hidden on mobile */}
        <div className="hide-mobile">
          <Sidebar activeRoute="/report" />
        </div>

        {/* Form Card */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="glass" style={{ borderRadius: 24, padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <FileText size={22} color="#5B7BFA" />
              <h1 style={{ fontWeight: 800, fontSize: 22, color: '#0F2A5C', margin: 0 }}>Report an Item</h1>
            </div>
            <p style={{ color: '#4A5B7A', fontSize: 14, margin: '0 0 28px' }}>
              Fill in the details below to report a lost or found item. The item will appear on the dashboard once you submit it.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              {/* Item Type Toggle */}
              <div style={{ marginBottom: 22 }}>
                <span style={labelStyle}>Item Type <span style={{ color: '#E5484D' }}>*</span></span>
                <div style={{ display: 'flex', background: '#F0F4FF', borderRadius: 12, padding: 4, width: 'fit-content' }}>
                  {(['lost', 'found'] as ItemType[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      id={`type-${t}`}
                      onClick={() => set('type', t)}
                      style={{
                        padding: '8px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
                        fontWeight: 600, fontSize: 14, transition: 'all 0.15s',
                        ...(form.type === t
                          ? { background: 'linear-gradient(135deg, #7C9CFF, #5B7BFA)', color: 'white', boxShadow: '0 4px 14px rgba(91,123,250,0.3)' }
                          : { background: 'transparent', color: '#4A5B7A' }
                        ),
                      }}
                    >
                      {t === 'lost' ? '😟 Lost' : '🙂 Found'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 1: Name + Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label htmlFor="item-name" style={labelStyle}>Item Name <span style={{ color: '#E5484D' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <Tag size={16} color="#8A9BB8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      id="item-name"
                      type="text"
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      placeholder="e.g. Black Wallet"
                      maxLength={60}
                      style={{ ...inputStyle, borderColor: errors.name ? '#E5484D' : '#DCE6F7' }}
                    />
                  </div>
                  {errors.name && <p style={errorStyle}>{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="item-category" style={labelStyle}>Category <span style={{ color: '#E5484D' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <Tag size={16} color="#8A9BB8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                    <select
                      id="item-category"
                      value={form.category}
                      onChange={e => set('category', e.target.value)}
                      style={{ ...inputStyle, borderColor: errors.category ? '#E5484D' : '#DCE6F7', appearance: 'none' }}
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {errors.category && <p style={errorStyle}>{errors.category}</p>}
                </div>
              </div>

              {/* Row 2: Location + Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label htmlFor="item-location" style={labelStyle}>Location <span style={{ color: '#E5484D' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} color="#8A9BB8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                    <input
                      id="item-location"
                      type="text"
                      value={form.location}
                      onChange={e => set('location', e.target.value)}
                      placeholder="e.g. Library"
                      list="location-suggestions"
                      maxLength={40}
                      style={{ ...inputStyle, borderColor: errors.location ? '#E5484D' : '#DCE6F7' }}
                    />
                    <datalist id="location-suggestions">
                      {LOCATIONS.map(l => <option key={l} value={l} />)}
                    </datalist>
                  </div>
                  {errors.location && <p style={errorStyle}>{errors.location}</p>}
                </div>

                <div>
                  <label htmlFor="item-date" style={labelStyle}>Date <span style={{ color: '#E5484D' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} color="#8A9BB8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                    <input
                      id="item-date"
                      type="date"
                      value={form.date}
                      onChange={e => set('date', e.target.value)}
                      max={today}
                      style={{ ...inputStyle, borderColor: errors.date ? '#E5484D' : '#DCE6F7' }}
                    />
                  </div>
                  {errors.date && <p style={errorStyle}>{errors.date}</p>}
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="item-description" style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Description <span style={{ color: '#E5484D' }}>*</span></span>
                  <span style={{ fontWeight: 400, color: '#8A9BB8', fontSize: 12 }}>{form.description.length}/200</span>
                </label>
                <textarea
                  id="item-description"
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Add a short description..."
                  maxLength={200}
                  rows={3}
                  style={{ ...inputStyle, paddingLeft: 14, resize: 'vertical', borderColor: errors.description ? '#E5484D' : '#DCE6F7' }}
                />
                {errors.description && <p style={errorStyle}>{errors.description}</p>}
              </div>

              {/* Contact */}
              <div style={{ marginBottom: 24 }}>
                <label htmlFor="item-contact" style={labelStyle}>Contact Information <span style={{ color: '#E5484D' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="#8A9BB8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    id="item-contact"
                    type="text"
                    value={form.contact}
                    onChange={e => set('contact', e.target.value)}
                    placeholder="Phone number or Email (or both, comma-separated)"
                    style={{ ...inputStyle, borderColor: errors.contact ? '#E5484D' : '#DCE6F7' }}
                  />
                </div>
                {errors.contact && <p style={errorStyle}>{errors.contact}</p>}
              </div>

              {/* Verification sub-card */}
              <div style={{
                background: 'rgba(91,123,250,0.06)', borderRadius: 16,
                border: '1.5px solid rgba(91,123,250,0.2)',
                padding: '20px 20px',
                marginBottom: 28,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Lock size={18} color="#5B7BFA" />
                  <span style={{ fontWeight: 700, color: '#0F2A5C', fontSize: 15 }}>Verify it's yours</span>
                </div>
                <p style={{ fontSize: 12, color: '#4A5B7A', margin: '0 0 14px' }}>
                  {form.type === 'lost'
                    ? "Ask something only the person who found it could answer, e.g. 'What sticker is on the back?'"
                    : "Ask something only the real owner would know, e.g. 'What's the phone wallpaper?'"}
                </p>

                {/* Question chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {QUESTION_CHIPS.map(chip => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => set('question', chip)}
                      style={{
                        padding: '5px 12px', borderRadius: 20,
                        border: `1px solid ${form.question === chip ? '#5B7BFA' : '#DCE6F7'}`,
                        background: form.question === chip ? 'rgba(91,123,250,0.12)' : 'rgba(255,255,255,0.7)',
                        color: form.question === chip ? '#5B7BFA' : '#4A5B7A',
                        fontSize: 12, fontWeight: 500, cursor: 'pointer',
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label htmlFor="verify-question" style={labelStyle}>Question <span style={{ color: '#E5484D' }}>*</span></label>
                    <input
                      id="verify-question"
                      type="text"
                      value={form.question}
                      onChange={e => set('question', e.target.value)}
                      placeholder="Your verification question"
                      style={{ ...inputStyle, paddingLeft: 14, borderColor: errors.question ? '#E5484D' : '#DCE6F7' }}
                    />
                    {errors.question && <p style={errorStyle}>{errors.question}</p>}
                  </div>
                  <div>
                    <label htmlFor="verify-answer" style={labelStyle}>Answer <span style={{ color: '#E5484D' }}>*</span></label>
                    <input
                      id="verify-answer"
                      type="text"
                      value={form.answer}
                      onChange={e => set('answer', e.target.value)}
                      placeholder="Secret answer (not shown publicly)"
                      style={{ ...inputStyle, paddingLeft: 14, borderColor: errors.answer ? '#E5484D' : '#DCE6F7' }}
                    />
                    {errors.answer && <p style={errorStyle}>{errors.answer}</p>}
                  </div>
                </div>
                <p style={{ fontSize: 11, color: '#8A9BB8', margin: '10px 0 0' }}>
                  🔒 We never show your answer or contact until someone answers correctly.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                id="btn-submit-listing"
                style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '14px', opacity: submitting ? 0.75 : 1 }}
              >
                {submitting ? <><span className="spinner" /> Submitting...</> : <><Send size={18} /> Submit Listing</>}
              </button>
            </form>
          </div>
        </div>

        {/* Quick Tips - hidden on mobile */}
        <aside className="hide-mobile" style={{ width: 240, flexShrink: 0 }}>
          <div className="glass" style={{ borderRadius: 20, padding: '24px 20px', position: 'sticky', top: 92 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Lightbulb size={18} color="#F5B942" />
              <h3 style={{ fontWeight: 700, color: '#0F2A5C', fontSize: 15, margin: 0 }}>Quick Tips</h3>
            </div>
            <ol style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Be as detailed as possible (helps with faster recovery)',
                'Use a clear item name and category',
                'Add your contact info so the owner can reach you',
                'Pick a question only the real owner/finder can answer',
              ].map((tip, i) => (
                <li key={i} style={{ fontSize: 13, color: '#4A5B7A', lineHeight: 1.5 }}>{tip}</li>
              ))}
            </ol>
          </div>
          <div style={{ padding: '20px 8px', fontFamily: "'Caveat', cursive", fontSize: 20, color: '#4A5B7A', transform: 'rotate(-2deg)' }}>
            Every listing helps the campus! ♡
          </div>
        </aside>
      </div>

      {matchPanel && (
        <MatchPanel
          newItem={matchPanel.item}
          matches={matchPanel.matches}
          onSkip={() => { setMatchPanel(null); navigate('/') }}
        />
      )}

      {/* Mobile bottom nav */}
      <nav className="mobile-bottom-nav">
        <MobileNavItem to="/" label="Home" icon="🏠" />
        <MobileNavItem to="/report" label="Report" icon="➕" active />
        <MobileNavItem to="/search" label="Search" icon="🔍" />
        <MobileNavItem to="/my-reports" label="Mine" icon="📋" />
      </nav>
    </main>
  )
}

function MobileNavItem({ to, label, icon, active }: { to: string; label: string; icon: string; active?: boolean }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(to)}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 2, background: 'none', border: 'none', cursor: 'pointer',
        color: active ? '#5B7BFA' : '#8A9BB8', fontSize: 11, fontWeight: active ? 700 : 400, padding: 8,
      }}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      {label}
    </button>
  )
}
