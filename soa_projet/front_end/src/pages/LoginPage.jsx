import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extractApiError } from '../api/client';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = await login(email, password);
      if (payload.roles.includes('ADMIN')) navigate('/admin');
      else if (payload.roles.includes('JURY_MEMBER') || payload.roles.includes('SUPERVISOR')) navigate('/jury');
      else if (payload.roles.includes('STUDENT')) navigate('/student');
      else navigate('/forbidden');
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      {/* Left brand panel */}
      <div className="login-brand">
        <div className="login-logo-ring">🎓</div>
        <h1>Soutenza</h1>
        <p>Plateforme de gestion des soutenances académiques — organisée, sécurisée, efficace.</p>
        <div className="login-brand-pills">
          <span>Étudiants</span>
          <span>Jurys</span>
          <span>Administration</span>
          <span>Publications</span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="login-form-side">
        <div className="login-card">
          <h2>Connexion</h2>
          <p>Accédez à votre espace personnel</p>

          {error && <div className="notice error" style={{ position:'relative',top:'auto',right:'auto',marginBottom:'1.25rem',animation:'none' }}>{error}</div>}

          <form className="grid" onSubmit={handleSubmit}>
            <label className="field">
              <span>Adresse email</span>
              <input
                id="login-email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </label>
            <label className="field">
              <span>Mot de passe</span>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button id="login-submit" disabled={loading} style={{ marginTop: '0.25rem' }}>
              {loading ? (
                <><span style={{ opacity: 0.7 }}>Connexion en cours</span></>
              ) : (
                <>Se connecter →</>
              )}
            </button>
          </form>

          <div className="login-hint">
            <strong style={{ color: 'var(--text-2)', display: 'block', marginBottom: '0.4rem' }}>Comptes de démonstration</strong>
            <div>Admin : <strong style={{ color:'var(--text-1)' }}>admin@soutenza.local</strong></div>
            <div>Étudiant : <strong style={{ color:'var(--text-1)' }}>etudiant1@soutenza.local</strong></div>
            <div>Jury : <strong style={{ color:'var(--text-1)' }}>jury1@soutenza.local</strong></div>
            <div style={{ marginTop:'0.35rem' }}>Mot de passe : <strong style={{ color:'var(--text-1)' }}>password</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
