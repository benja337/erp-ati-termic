import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, DollarSign, AlertTriangle, Camera, CheckSquare, LogOut, Menu, X } from 'lucide-react';
import logo from '../assets/logo.png';

const NAV_ITEMS = [
  { to: '/bitacora', icon: BookOpen, label: 'Bitácora' },
  { to: '/caja-chica', icon: DollarSign, label: 'Caja Chica' },
  { to: '/sso', icon: AlertTriangle, label: 'Incidentes SSO' },
  { to: '/evidencia', icon: Camera, label: 'Evidencias' }
];

export default function Sidebar() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const sidebarContent = (
    <div style={{
      width: 240,
      minHeight: '100vh',
      background: '#0D1117',
      borderRight: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--color-border)' }}>
        <img src={logo} alt="ATI Termic" style={{ maxWidth: 160, display: 'block' }} />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 0' }}>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 20px',
              color: isActive ? '#E6EDF3' : '#8B949E',
              background: isActive ? 'var(--color-bg-elevated)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--color-blue)' : '3px solid transparent',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              transition: 'all 0.15s'
            })}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}

        {usuario.rol === 'admin' && (
          <NavLink
            to="/validar"
            onClick={() => setMobileOpen(false)}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 20px',
              color: isActive ? '#E6EDF3' : '#8B949E',
              background: isActive ? 'var(--color-bg-elevated)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--color-blue)' : '3px solid transparent',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              transition: 'all 0.15s'
            })}
          >
            <CheckSquare size={16} />
            Validar Evidencias
          </NavLink>
        )}
      </nav>

      {/* User */}
      <div style={{ borderTop: '1px solid var(--color-border)', padding: '16px 20px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>
          {usuario.nombre || 'Usuario'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>
          {usuario.rol === 'admin' ? 'Administrador' : 'Supervisor'}
        </div>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="sidebar-desktop" style={{ display: 'flex' }}>
        {sidebarContent}
      </div>

      {/* Mobile hamburger */}
      <button
        className="hamburger-btn"
        onClick={() => setMobileOpen(true)}
        style={{
          display: 'none',
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 100,
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 4,
          padding: '6px 8px',
          cursor: 'pointer',
          color: 'var(--color-text-primary)'
        }}
      >
        <Menu size={20} />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
              zIndex: 200
            }}
          />
          <div style={{
            position: 'fixed', top: 0, left: 0, zIndex: 300,
            animation: 'slideRight 0.2s ease'
          }}>
            {sidebarContent}
            <button
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'absolute', top: 12, right: -40,
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 4, padding: '4px 6px',
                cursor: 'pointer', color: 'var(--color-text-primary)'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
        @keyframes slideRight { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      `}</style>
    </>
  );
}
