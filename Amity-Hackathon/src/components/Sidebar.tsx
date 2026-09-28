import { NavLink, useNavigate } from 'react-router-dom'
import { Home, PlusCircle, Search, FileText, Heart } from 'lucide-react'

interface SidebarProps {
  activeRoute?: string
}

export function Sidebar({ activeRoute }: SidebarProps) {
  const navigate = useNavigate()

  const navItems = [
    { label: 'Home', icon: Home, to: '/' },
    { label: 'Report Item', icon: PlusCircle, to: '/report' },
    { label: 'Browse Listings', icon: Search, to: '/search' },
    { label: 'My Reports', icon: FileText, to: '/my-reports' },
  ]

  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: 'rgba(255,255,255,0.65)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.75)',
      borderRadius: 20,
      padding: '24px 16px',
      display: 'flex', flexDirection: 'column',
      height: 'fit-content', position: 'sticky', top: 92,
    }}>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 12, textDecoration: 'none',
              fontSize: 14, fontWeight: isActive || activeRoute === to ? 700 : 500,
              color: isActive || activeRoute === to ? '#5B7BFA' : '#4A5B7A',
              background: isActive || activeRoute === to ? 'linear-gradient(135deg, rgba(124,156,255,0.15), rgba(91,123,250,0.08))' : 'transparent',
              transition: 'all 0.15s',
            })}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: 24 }}>
        <button
          onClick={() => navigate('/report')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'flex-start', gap: 6,
          }}
        >
          <Heart size={16} color="#E5484D" style={{ marginTop: 3 }} />
          <span style={{
            fontFamily: "'Caveat', cursive", fontSize: 17, color: '#4A5B7A',
            textAlign: 'left', lineHeight: 1.3,
          }}>
            Lost something? Found something? Help your campus community!
          </span>
        </button>
      </div>
    </aside>
  )
}
