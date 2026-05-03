import { useState } from 'react';
import client, { extractApiError } from '../api/client';

export default function ChangePasswordModal({ onClose }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await client.put('/auth/password', { oldPassword, newPassword });
      setMessage(res.data.message);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div className="card narrow" style={modalStyle}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#1f2937' }}>Changer le mot de passe</h3>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#6b7280' }}>
            Sécurisez votre compte avec un nouveau mot de passe (min. 6 caractères)
          </p>
        </div>
        
        {message && <div className="notice success">{message}</div>}
        {error && <div className="notice error">{error}</div>}
        
        <form className="grid" onSubmit={handleSubmit}>
          <label className="field">
            <span style={{ fontWeight: '500' }}>Ancien mot de passe</span>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                value={oldPassword} 
                onChange={(e) => setOldPassword(e.target.value)} 
                placeholder="••••••••"
                style={{ ...inputStyle, width: '100%', paddingRight: '2.5rem' }}
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={eyeBtnStyle}
                title={showPassword ? "Masquer" : "Afficher"}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </label>
          <label className="field">
            <span style={{ fontWeight: '500' }}>Nouveau mot de passe</span>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="••••••••"
                minLength={6} 
                style={{ ...inputStyle, width: '100%', paddingRight: '2.5rem' }}
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={eyeBtnStyle}
                title={showPassword ? "Masquer" : "Afficher"}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </label>
          <div className="actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="secondary" onClick={onClose} style={{ padding: '0.5rem 1.25rem' }}>Annuler</button>
            <button disabled={loading} style={{ padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {loading ? (
                <>⏳ Modification...</>
              ) : (
                <>💾 Confirmer</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.4)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  animation: 'fadeIn 0.2s ease-out'
};

const modalStyle = {
  width: '100%',
  maxWidth: '420px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  borderRadius: '12px',
  padding: '2rem',
  animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
};

const inputStyle = {
  padding: '0.6rem 0.8rem',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const eyeBtnStyle = {
  position: 'absolute',
  right: '0.5rem',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  padding: '0',
  margin: '0',
  cursor: 'pointer',
  fontSize: '1.2rem',
  color: '#6b7280',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

// Injection des keyframes d'animation
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
`;
document.head.appendChild(styleSheet);
