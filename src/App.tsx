import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Building2, FileText, Settings, Menu, X, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Borrowers from './pages/Borrowers'
import Employers from './pages/Employers'
import Applications from './pages/Applications'
import Analytics from './pages/Analytics'
import SettingsPage from './pages/SettingsPage'
import './App.css'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/borrowers', label: 'Borrowers', icon: Users },
  { to: '/employers', label: 'Employers', icon: Building2 },
  { to: '/applications', label: 'Applications', icon: FileText },
  { to: '/analytics', label: 'Analytics', icon: TrendingUp },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <BrowserRouter>
      <div className="app-layout">
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="logo">
              <div className="logo-mark">
                <span>P</span>
              </div>
              <div className="logo-text">
                <span className="logo-name">PayLink</span>
                <span className="logo-sub">Lending Platform</span>
              </div>
            </div>
            <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <nav className="sidebar-nav">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="user-card">
              <div className="user-avatar">AD</div>
              <div className="user-info">
                <span className="user-name">Admin User</span>
                <span className="user-role">Risk Manager</span>
              </div>
            </div>
          </div>
        </aside>

        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

        <div className="main-content">
          <header className="topbar">
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="topbar-right">
              <div className="status-indicator">
                <span className="status-dot" />
                <span>All systems operational</span>
              </div>
            </div>
          </header>

          <main className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/borrowers" element={<Borrowers />} />
              <Route path="/employers" element={<Employers />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}
