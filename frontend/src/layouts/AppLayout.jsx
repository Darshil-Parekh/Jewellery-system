import { useState } from 'react'
import { Bell, ChevronDown, Gem, LogOut, Search } from 'lucide-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Sidebar, MenuButton } from '../components/Sidebar'
import { useAuth } from '../context/auth-context'

const titles = {
  '/dashboard': 'Dashboard',
  '/inventory': 'Inventory',
  '/categories': 'Categories',
  '/purchases': 'Purchases',
  '/sales': 'Sales & invoices',
  '/customers': 'Customers',
  '/suppliers': 'Suppliers',
  '/metal-rates': 'Metal rates',
  '/reports': 'Reports',
  '/staff': 'Staff management',
  '/settings': 'Settings',
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const title = location.pathname.startsWith('/sales/')
    ? 'Invoice details'
    : titles[location.pathname] || 'Workspace'

  async function handleLogout() {
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={() => {
          setMenuOpen(false)
          setSidebarOpen(false)
        }}
        onLogout={handleLogout}
      />
      <div className="app-main">
        <header className="topbar">
          <div className="topbar-heading">
            <MenuButton onClick={() => setSidebarOpen(true)} />
            <div className="breadcrumb"><span>Maison Ledger</span><span className="breadcrumb-slash">/</span><strong>{title}</strong></div>
          </div>
          <div className="topbar-actions">
            <label className="global-search">
              <Search size={16} aria-hidden="true" />
              <input type="search" placeholder="Search the workspace" disabled aria-label="Workspace search, coming soon" />
              <kbd>⌘ K</kbd>
            </label>
            {user?.role === 'ADMIN' && (
              <Link to="/metal-rates" className="rate-shortcut">
                <span className="rate-shortcut-icon"><Gem size={15} /></span>
                <span><small>METAL RATES</small><strong>Not configured</strong></span>
              </Link>
            )}
            <button className="notification-button" type="button" aria-label="Notifications are not configured" disabled>
              <Bell size={18} /><span className="notification-dot" />
            </button>
            <div className="profile-menu-wrap">
              <button
                className="profile-trigger"
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <span className="user-avatar topbar-avatar">{initials(user?.fullName || user?.email)}</span>
                <span className="profile-copy"><strong>{user?.fullName || user?.email}</strong><small>{user?.role === 'ADMIN' ? 'Administrator' : 'Staff'}</small></span>
                <ChevronDown size={15} />
              </button>
              {menuOpen && (
                <div className="profile-menu" role="menu">
                  <span className="profile-menu-email">{user?.email}</span>
                  <button type="button" role="menuitem" onClick={handleLogout}>
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
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
