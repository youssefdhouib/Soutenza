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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const links = [];
  if (user?.roles?.includes('ADMIN')) links.push({ to: '/admin', label: 'Admin' });
  if (user?.roles?.includes('JURY_MEMBER')) links.push({ to: '/jury', label: 'Jury' });
  if (user?.roles?.includes('STUDENT')) links.push({ to: '/student', label: 'Étudiant' });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const defaultRoute = user?.roles?.map((r) => roleHome[r]).find(Boolean) || '/login';

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand-btn" onClick={() => navigate(defaultRoute)}>Soutenza</button>
        <nav className="topnav">
          {links.map((item) => (
            <Link key={item.to} className={location.pathname.startsWith(item.to) ? 'active' : ''} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="account-block">
          <span>{user?.email}</span>
          <button type="button" className="secondary" onClick={() => setShowPasswordModal(true)} style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            🔒 Changer mot de passe ?
          </button>
          <button className="danger" onClick={handleLogout}>Déconnexion</button>
        </div>
      </header>
      <main className="content">{children}</main>
      
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  );
}

