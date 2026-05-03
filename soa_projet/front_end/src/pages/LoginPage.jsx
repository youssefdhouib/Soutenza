import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extractApiError } from '../api/client';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@soutenza.local');
  const [password, setPassword] = useState('password');
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
    <div className="screen-center">
      <div className="card narrow">
        <h2>Soutenza</h2>
        <p>Connexion à la plateforme de gestion des soutenances.</p>
        {error && <div className="notice error">{error}</div>}
        <form className="grid" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="field">
            <span>Mot de passe</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <button disabled={loading}>{loading ? 'Connexion...' : 'Se connecter'}</button>
        </form>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#4b5563' }}>
          Comptes seed: <strong>admin@soutenza.local</strong>, <strong>etudiant1@soutenza.local</strong>, <strong>jury1@soutenza.local</strong> (mot de passe: <strong>password</strong>)
        </p>
      </div>
    </div>
  );
}
