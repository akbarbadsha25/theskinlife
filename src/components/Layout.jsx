import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, ArrowLeft } from 'lucide-react';
import Sidebar from './Sidebar';
import Toast from './Toast';
import { useApp } from '../context/AppContext';

const MAIN_ROUTES = ['/', '/patients', '/appointments', '/reminders', '/settings'];

function MobileTopbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isInnerPage = !MAIN_ROUTES.includes(location.pathname);

  return (
    <div className="mobile-topbar">
      {isInnerPage ? (
        <button className="mobile-menu-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft size={22} />
        </button>
      ) : (
        <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={22} />
        </button>
      )}
      <div className="mobile-topbar-logo">
        <img src="https://www.theskinlife.co.in/logo.png" alt="The Skin Life" />
      </div>
      <div style={{ width: 40 }} />
    </div>
  );
}

export default function Layout({ children }) {
  const { toasts } = useApp();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-layout">
      <MobileTopbar onMenuClick={() => setSidebarOpen(true)} />
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <main className="main-content">
          {children}
        </main>
      </div>
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} />
          ))}
        </div>
      )}
    </div>
  );
}
