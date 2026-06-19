import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, MessageCircle, CalendarDays, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ open, onClose }) {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/patients', icon: Users, label: 'Patients' },
    { path: '/appointments', icon: CalendarDays, label: 'Appointments' },
    { path: '/reminders', icon: MessageCircle, label: 'Reminders' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="sidebar-header">
        <img
          src="https://www.theskinlife.co.in/SL_grn_bg.png"
          alt="The Skin Life"
          className="sidebar-logo-img"
        />
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-link ${isActive && (item.path === '/' ? location.pathname === '/' : true) ? 'active' : ''}`
            }
            end={item.path === '/'}
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {currentUser?.initials}
          </div>
          <div className="sidebar-user-info">
            <span className="name">{currentUser?.name}</span>
            <span className="role-badge">{currentUser?.role === 'doctor' ? 'Doctor' : 'Receptionist'}</span>
          </div>
          <button className="sidebar-logout-btn" onClick={logout} title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
