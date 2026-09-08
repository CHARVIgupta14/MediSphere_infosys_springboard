import './TopHeader.css'

export default function TopHeader({ title, subtitle, onMenuClick }) {
  return (
    <header className="top-header">
      <button className="menu-btn" onClick={onMenuClick} aria-label="Open menu">
        ☰
      </button>
      <div>
        <h1 className="top-header-title">{title}</h1>
        {subtitle && <p className="top-header-subtitle">{subtitle}</p>}
      </div>
    </header>
  )
}
