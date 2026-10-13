import {
  BarChart3,
  Boxes,
  ChevronLeft,
  Gem,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  Settings2,
  ShoppingBag,
  Sparkles,
  Tags,
  UsersRound,
  WalletCards,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const primaryLinks = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Inventory', path: '/inventory', icon: Boxes },
  { label: 'Categories', path: '/categories', icon: Tags },
]

const businessLinks = [
  { label: 'Purchases', path: '/purchases', icon: PackageCheck },
  { label: 'Sales & invoices', path: '/sales', icon: WalletCards },
  { label: 'Customers', path: '/customers', icon: UsersRound },
  { label: 'Suppliers', path: '/suppliers', icon: ShoppingBag },
]

const workspaceLinks = [
  { label: 'Metal rates', path: '/metal-rates', icon: Gem },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Staff management', path: '/staff', icon: UsersRound },
  { label: 'Settings', path: '/settings', icon: Settings2 },
]

function LinkGroup({ heading, links, onNavigate }) {
  return (
    <div className="nav-group">
      <span className="nav-heading">{heading}</span>
      {links.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          onClick={onNavigate}
          className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}
        >
          <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </div>
  )
}

export function Sidebar({ user, open, onClose, onNavigate, onLogout }) {
  const isAdmin = user?.role === 'ADMIN'
  const primaryNavigation = isAdmin ? primaryLinks : primaryLinks.slice(0, 2)
  const links = isAdmin ? workspaceLinks : [businessLinks[1]]

  return (
    <>
      <button
        type="button"
        className={`mobile-scrim${open ? ' mobile-scrim-visible' : ''}`}
        aria-label="Close navigation"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <aside className={`sidebar${open ? ' sidebar-open' : ''}`} aria-label="Main navigation">
        <div className="brand">
          <span className="brand-mark"><Gem size={19} strokeWidth={1.6} /></span>
          <div className="brand-copy">
            <span className="brand-name">MAISON <b>LEDGER</b></span>
            <span className="brand-caption">JEWELLERY MANAGEMENT</span>
          </div>
          <button className="sidebar-close" type="button" onClick={onClose} aria-label="Close navigation">
            <X size={19} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <LinkGroup heading="WORKSPACE" links={primaryNavigation} onNavigate={onNavigate} />
          {isAdmin && (
            <LinkGroup heading="MANAGEMENT" links={businessLinks} onNavigate={onNavigate} />
          )}
          <LinkGroup heading={isAdmin ? 'INSIGHTS & SETTINGS' : 'ACCOUNT'} links={links} onNavigate={onNavigate} />
        </nav>

        <div className="sidebar-footer">
          <div className="store-card">
            <span className="store-icon"><Sparkles size={16} /></span>
            <div><strong>Your workspace</strong><span>Private & secure</span></div>
            <span className="status-dot" aria-label="Workspace active" />
          </div>
          <div className="sidebar-user">
            <span className="user-avatar">{initials(user?.fullName || user?.email)}</span>
            <div className="sidebar-user-copy">
              <strong>{user?.fullName || user?.email}</strong>
              <span>{user?.role === 'ADMIN' ? 'Administrator' : 'Staff member'}</span>
            </div>
            <button className="logout-icon" type="button" title="Sign out" aria-label="Sign out" onClick={onLogout}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export function MenuButton({ onClick }) {
  return (
    <button className="menu-button" type="button" onClick={onClick} aria-label="Open navigation">
      <Menu size={20} />
    </button>
  )
}

export function BackButton({ onClick }) {
  return (
    <button className="sidebar-close" type="button" onClick={onClick} aria-label="Close navigation">
      <ChevronLeft size={19} />
    </button>
  )
}

function initials(name = '') {
  return name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'M'
}
