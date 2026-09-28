import reactLogo from '../assets/react.svg'
import viteLogo from '../assets/vite.svg'

export function Footer() {
  return (
    <footer style={{
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(255,255,255,0.75)',
      padding: '20px 24px',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🏛️</span>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: '#4A5B7A' }}>
            Lost something? Found something?
          </span>
        </div>

        <div style={{ textAlign: 'right' }}>
          <p style={{ color: '#0F2A5C', fontWeight: 600, fontSize: 13, margin: '0 0 4px' }}>
            Campus Lost &amp; Found &nbsp;·&nbsp; Small things. Big stories. ♡
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 11, color: '#8A9BB8' }}>Built with</span>
            <img src={reactLogo} alt="React" style={{ height: 16, width: 16 }} />
            <img src={viteLogo} alt="Vite" style={{ height: 16, width: 16 }} />
            <a
              href="https://github.com/technology67613/Hackathon-Amity"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center' }}
              aria-label="GitHub"
            >
              <svg width="16" height="16" viewBox="0 0 19 19" aria-hidden="true">
                <use href="/icons.svg#github-icon" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
