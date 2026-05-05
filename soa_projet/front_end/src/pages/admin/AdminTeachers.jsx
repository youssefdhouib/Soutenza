import { useState } from 'react';
import client, { extractApiError } from '../../api/client';

const initialRegisterTeacher = { firstName:'', lastName:'', email:'', rank:'', specialty:'', role:'JURY_MEMBER' };
const initialTeacher = { id:null, firstName:'', lastName:'', email:'', rank:'', specialty:'', active:true, userId:'' };

function normalizePayload(model) {
  const p = { ...model };
  Object.keys(p).forEach(k => { if (p[k] === '') p[k] = null; });
  return p;
}

export default function AdminTeachers({ teachers, onReload, setMessage, setError }) {
  const [registerForm, setRegisterForm] = useState(initialRegisterTeacher);
  const [editForm, setEditForm] = useState(initialTeacher);
  const [showRegister, setShowRegister] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await client.post('/auth/register/teacher', registerForm);
      setMessage(res.data.message || "Compte enseignant créé et email envoyé.");
      setRegisterForm(initialRegisterTeacher);
      setShowRegister(false);
      onReload();
    } catch (err) { setError(extractApiError(err)); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await client.put(`/teachers/${editForm.id}`, normalizePayload(editForm));
      setMessage("Enseignant mis à jour avec succès.");
      setEditForm(initialTeacher);
      onReload();
    } catch (err) { setError(extractApiError(err)); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet enseignant ? Action irréversible.")) return;
    try {
      await client.delete(`/teachers/${id}`);
      setMessage("Enseignant supprimé.");
      onReload();
    } catch (err) { setError(extractApiError(err)); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Enseignants &amp; Jury</h2>
          <p>{teachers.length} enseignant{teachers.length !== 1 ? 's' : ''} enregistré{teachers.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowRegister(v => !v)}>
          {showRegister ? '✕ Fermer' : '+ Créer un compte'}
        </button>
      </div>

      {showRegister && (
        <div className="card" style={{ marginBottom:'1.25rem' }}>
          <h3>✉️ Nouveau compte enseignant / jury</h3>
          <p style={{ marginBottom:'1rem' }}>Un mot de passe temporaire sera généré et envoyé par email.</p>
          <form onSubmit={handleRegister}>
            <div className="form-grid" style={{ marginBottom:'1rem' }}>
              <label className="field"><span>Prénom</span><input value={registerForm.firstName} onChange={e => setRegisterForm({...registerForm, firstName:e.target.value})} required /></label>
              <label className="field"><span>Nom</span><input value={registerForm.lastName} onChange={e => setRegisterForm({...registerForm, lastName:e.target.value})} required /></label>
              <label className="field"><span>Email</span><input type="email" value={registerForm.email} onChange={e => setRegisterForm({...registerForm, email:e.target.value})} required /></label>
              <label className="field"><span>Grade</span><input value={registerForm.rank} onChange={e => setRegisterForm({...registerForm, rank:e.target.value})} required /></label>
              <label className="field"><span>Spécialité</span><input value={registerForm.specialty} onChange={e => setRegisterForm({...registerForm, specialty:e.target.value})} required /></label>
            </div>
            <div className="actions">
              <button type="submit">Créer et envoyer l'email</button>
              <button type="button" className="secondary" onClick={() => { setRegisterForm(initialRegisterTeacher); setShowRegister(false); }}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {editForm.id && (
        <div className="inline-edit" style={{ marginBottom:'1.25rem' }}>
          <h3 style={{ marginBottom:'1rem' }}>✏️ Modifier l'enseignant #{editForm.id}</h3>
          <form onSubmit={handleEdit}>
            <div className="form-grid" style={{ marginBottom:'1rem' }}>
              <label className="field"><span>Prénom</span><input value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName:e.target.value})} required /></label>
              <label className="field"><span>Nom</span><input value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName:e.target.value})} required /></label>
              <label className="field"><span>Email</span><input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email:e.target.value})} required /></label>
              <label className="field"><span>Grade</span><input value={editForm.rank} onChange={e => setEditForm({...editForm, rank:e.target.value})} required /></label>
              <label className="field"><span>Spécialité</span><input value={editForm.specialty} onChange={e => setEditForm({...editForm, specialty:e.target.value})} required /></label>
            </div>
            <div className="actions">
              <button type="submit">Enregistrer</button>
              <button type="button" className="secondary" onClick={() => setEditForm(initialTeacher)}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Nom complet</th><th>Email</th><th>Grade</th><th>Spécialité</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {teachers.length === 0 && (
                <tr><td colSpan="6"><div className="empty-state"><div className="empty-icon">👨‍🏫</div><p>Aucun enseignant enregistré.</p></div></td></tr>
              )}
              {teachers.map(t => (
                <tr key={t.id}>
                  <td><span className="badge badge-gray">#{t.id}</span></td>
                  <td><strong>{t.firstName} {t.lastName}</strong></td>
                  <td style={{ color:'var(--text-2)', fontSize:'0.82rem' }}>{t.email}</td>
                  <td><span className="badge badge-purple">{t.rank}</span></td>
                  <td>{t.specialty}</td>
                  <td>
                    <div className="td-actions">
                      <button className="secondary sm" onClick={() => setEditForm({...t, userId:t.userId||''})}>Éditer</button>
                      <button className="danger sm" onClick={() => handleDelete(t.id)}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
