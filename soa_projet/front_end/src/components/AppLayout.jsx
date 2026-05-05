import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';

const roleHome = {
  ADMIN: '/admin',
  JURY_MEMBER: '/jury',
  STUDENT: '/student',
  SUPERVISOR: '/jury',
};

export default function AppLayout({ children }) {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const links = [];
  if (user?.roles?.includes('ADMIN'))      links.push({ to: '/admin',   label: 'Admin' });
  if (user?.roles?.includes('JURY_MEMBER')) links.push({ to: '/jury',    label: 'Jury' });
  if (user?.roles?.includes('STUDENT'))    links.push({ to: '/student', label: 'Espace Étudiant' });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const defaultRoute = user?.roles?.map((r) => roleHome[r]).find(Boolean) || '/login';
  const initials = user?.email?.slice(0, 2).toUpperCase() || '??';

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand-btn" onClick={() => navigate(defaultRoute)}>
          <span className="brand-dot" />
          Soutenza
        </button>

        <nav className="topnav">
          {links.map((item) => (
            <Link
              key={item.to}
              className={location.pathname.startsWith(item.to) ? 'active' : ''}
              to={item.to}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="account-block">
          <button 
            type="button" 
            className="icon-btn" 
            onClick={toggleTheme} 
            title={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
            style={{ background: 'transparent', color: 'var(--text-1)', fontSize: '1.2rem', padding: '0.2rem' }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          
          <span className="account-email">{user?.email}</span>

          {/* User avatar + dropdown */}
          <div style={{ position: 'relative' }}>
            <div
              className="user-avatar"
              onClick={() => setShowUserMenu((v) => !v)}
              title="Mon compte"
            >
              {initials}
            </div>
            {showUserMenu && (
              <>
                <div
                  style={{ position:'fixed',inset:0,zIndex:200 }}
                  onClick={() => setShowUserMenu(false)}
                />
                <div style={{
                  position:'absolute',right:0,top:'calc(100% + 8px)',
                  background:'var(--bg-2)',border:'1px solid var(--border)',
                  borderRadius:'var(--radius)',padding:'0.5rem',
                  minWidth:'200px',zIndex:201,
                  boxShadow:'var(--shadow-lg)',
                }}>
                  <button
                    className="secondary"
                    style={{ width:'100%',justifyContent:'flex-start',borderRadius:'8px',marginBottom:'0.25rem' }}
                    onClick={() => { setShowUserMenu(false); setShowPasswordModal(true); }}
                  >
                    🔒 Changer le mot de passe
                  </button>
                  <button
                    className="danger"
                    style={{ width:'100%',justifyContent:'flex-start',borderRadius:'8px' }}
                    onClick={() => { setShowUserMenu(false); handleLogout(); }}
                  >
                    ← Déconnexion
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="content" style={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  );
}
