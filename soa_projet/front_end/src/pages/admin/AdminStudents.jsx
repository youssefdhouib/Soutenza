import { useState } from 'react';
import client, { extractApiError } from '../../api/client';

const initialRegisterStudent = { studentCode:'', firstName:'', lastName:'', email:'', department:'', level:'' };
const initialStudent = { id:null, studentCode:'', firstName:'', lastName:'', email:'', department:'', level:'', active:true, userId:'' };

function normalizePayload(model) {
  const p = { ...model };
  Object.keys(p).forEach(k => { if (p[k] === '') p[k] = null; });
  return p;
}

export default function AdminStudents({ students, onReload, setMessage, setError }) {
  const [registerForm, setRegisterForm] = useState(initialRegisterStudent);
  const [editForm, setEditForm] = useState(initialStudent);
  const [showRegister, setShowRegister] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await client.post('/auth/register/student', registerForm);
      setMessage(res.data.message || "Compte étudiant créé et email envoyé.");
      setRegisterForm(initialRegisterStudent);
      setShowRegister(false);
      onReload();
    } catch (err) { setError(extractApiError(err)); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await client.put(`/students/${editForm.id}`, normalizePayload(editForm));
      setMessage("Étudiant mis à jour avec succès.");
      setEditForm(initialStudent);
      onReload();
    } catch (err) { setError(extractApiError(err)); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet étudiant ? Action irréversible.")) return;
    try {
      await client.delete(`/students/${id}`);
      setMessage("Étudiant supprimé.");
      onReload();
    } catch (err) { setError(extractApiError(err)); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Étudiants</h2>
          <p>{students.length} étudiant{students.length !== 1 ? 's' : ''} enregistré{students.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowRegister(v => !v)}>
          {showRegister ? '✕ Fermer' : '+ Créer un compte'}
        </button>
      </div>

      {/* Registration form */}
      {showRegister && (
        <div className="card" style={{ marginBottom:'1.25rem' }}>
          <h3>✉️ Nouveau compte étudiant</h3>
          <p style={{ marginBottom:'1rem' }}>Un mot de passe temporaire sera généré et envoyé par email.</p>
          <form onSubmit={handleRegister}>
            <div className="form-grid" style={{ marginBottom:'1rem' }}>
              <label className="field"><span>Code étudiant</span><input value={registerForm.studentCode} onChange={e => setRegisterForm({...registerForm, studentCode:e.target.value})} required /></label>
              <label className="field"><span>Prénom</span><input value={registerForm.firstName} onChange={e => setRegisterForm({...registerForm, firstName:e.target.value})} required /></label>
              <label className="field"><span>Nom</span><input value={registerForm.lastName} onChange={e => setRegisterForm({...registerForm, lastName:e.target.value})} required /></label>
              <label className="field"><span>Email</span><input type="email" value={registerForm.email} onChange={e => setRegisterForm({...registerForm, email:e.target.value})} required /></label>
              <label className="field"><span>Département</span><input value={registerForm.department} onChange={e => setRegisterForm({...registerForm, department:e.target.value})} required /></label>
              <label className="field"><span>Niveau</span><input value={registerForm.level} onChange={e => setRegisterForm({...registerForm, level:e.target.value})} required /></label>
            </div>
            <div className="actions">
              <button type="submit">Créer et envoyer l'email</button>
              <button type="button" className="secondary" onClick={() => { setRegisterForm(initialRegisterStudent); setShowRegister(false); }}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Inline edit */}
      {editForm.id && (
        <div className="inline-edit" style={{ marginBottom:'1.25rem' }}>
          <h3 style={{ marginBottom:'1rem' }}>✏️ Modifier l'étudiant #{editForm.id}</h3>
          <form onSubmit={handleEdit}>
            <div className="form-grid" style={{ marginBottom:'1rem' }}>
              <label className="field"><span>Code</span><input value={editForm.studentCode} onChange={e => setEditForm({...editForm, studentCode:e.target.value})} required /></label>
              <label className="field"><span>Prénom</span><input value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName:e.target.value})} required /></label>
              <label className="field"><span>Nom</span><input value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName:e.target.value})} required /></label>
              <label className="field"><span>Email</span><input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email:e.target.value})} required /></label>
              <label className="field"><span>Département</span><input value={editForm.department} onChange={e => setEditForm({...editForm, department:e.target.value})} required /></label>
              <label className="field"><span>Niveau</span><input value={editForm.level} onChange={e => setEditForm({...editForm, level:e.target.value})} required /></label>
            </div>
            <div className="actions">
              <button type="submit">Enregistrer</button>
              <button type="button" className="secondary" onClick={() => setEditForm(initialStudent)}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Code</th><th>Nom complet</th><th>Email</th><th>Département</th><th>Niveau</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr><td colSpan="7"><div className="empty-state"><div className="empty-icon">🎓</div><p>Aucun étudiant enregistré.</p></div></td></tr>
              )}
              {students.map(s => (
                <tr key={s.id}>
                  <td><span className="badge badge-gray">#{s.id}</span></td>
                  <td><strong>{s.studentCode}</strong></td>
                  <td>{s.firstName} {s.lastName}</td>
                  <td style={{ color:'var(--text-2)', fontSize:'0.82rem' }}>{s.email}</td>
                  <td>{s.department}</td>
                  <td><span className="badge badge-blue">{s.level}</span></td>
                  <td>
                    <div className="td-actions">
                      <button className="secondary sm" onClick={() => setEditForm({...s, userId:s.userId||''})}>Éditer</button>
                      <button className="danger sm" onClick={() => handleDelete(s.id)}>Supprimer</button>
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
