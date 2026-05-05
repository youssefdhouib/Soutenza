import { useState } from 'react';
import client, { extractApiError } from '../../api/client';

const initialRoom = { id:null, code:'', name:'', building:'', capacity:30, active:true };

function normalizePayload(model) {
  const p = { ...model };
  Object.keys(p).forEach(k => { if (p[k] === '') p[k] = null; });
  return p;
}

export default function AdminRooms({ rooms, onReload, setMessage, setError }) {
  const [form, setForm] = useState(initialRoom);
  const [fieldError, setFieldError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldError('');
    if (form.capacity <= 0) { setFieldError("La capacité doit être supérieure à zéro."); return; }
    try {
      if (form.id) {
        await client.put(`/rooms/${form.id}`, normalizePayload(form));
        setMessage("Salle mise à jour avec succès.");
      } else {
        await client.post('/rooms', normalizePayload(form));
        setMessage("Salle créée avec succès.");
      }
      setForm(initialRoom);
      onReload();
    } catch (err) { setError(extractApiError(err)); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette salle ? Action irréversible.")) return;
    try {
      await client.delete(`/rooms/${id}`);
      setMessage("Salle supprimée.");
      onReload();
    } catch (err) { setError(extractApiError(err)); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Salles</h2>
          <p>{rooms.length} salle{rooms.length !== 1 ? 's' : ''} enregistrée{rooms.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom:'1.25rem' }}>
        <h3>{form.id ? `✏️ Modifier la salle #${form.id}` : '+ Nouvelle salle'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ marginBottom:'1rem' }}>
            <label className="field"><span>Code</span><input value={form.code} onChange={e => setForm({...form, code:e.target.value})} required /></label>
            <label className="field"><span>Nom</span><input value={form.name} onChange={e => setForm({...form, name:e.target.value})} required /></label>
            <label className="field"><span>Bâtiment</span><input value={form.building} onChange={e => setForm({...form, building:e.target.value})} required /></label>
            <label className="field">
              <span>Capacité</span>
              <input type="number" min="1" value={form.capacity} onChange={e => setForm({...form, capacity:Number(e.target.value)})} required />
              {fieldError && <span className="field-error">{fieldError}</span>}
            </label>
          </div>
          <div className="actions">
            <button type="submit">{form.id ? 'Mettre à jour' : 'Créer la salle'}</button>
            <button type="button" className="secondary" onClick={() => { setForm(initialRoom); setFieldError(''); }}>Réinitialiser</button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Code</th><th>Nom</th><th>Bâtiment</th><th>Capacité</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {rooms.length === 0 && (
                <tr><td colSpan="6"><div className="empty-state"><div className="empty-icon">🏛️</div><p>Aucune salle enregistrée.</p></div></td></tr>
              )}
              {rooms.map(r => (
                <tr key={r.id}>
                  <td><span className="badge badge-gray">#{r.id}</span></td>
                  <td><strong>{r.code}</strong></td>
                  <td>{r.name}</td>
                  <td>{r.building}</td>
                  <td><span className="badge badge-amber">{r.capacity} places</span></td>
                  <td>
                    <div className="td-actions">
                      <button className="secondary sm" onClick={() => setForm({...r})}>Éditer</button>
                      <button className="danger sm" onClick={() => handleDelete(r.id)}>Supprimer</button>
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
