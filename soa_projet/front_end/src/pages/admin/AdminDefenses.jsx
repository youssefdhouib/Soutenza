import { useState } from 'react';
import client, { extractApiError } from '../../api/client';
import { StatusPill } from './AdminOverview';

const defenseStatuses = ['DRAFT','PLANNED','IN_PROGRESS','COMPLETED','CANCELLED'];

const initialDefense = {
  id:null, subject:'', description:'', studentId:'', supervisorId:'',
  roomId:'', startDateTime:'', endDateTime:'', status:'PLANNED',
};

function toInputDateTime(value) { return value ? value.slice(0,16) : ''; }

function normalizePayload(model) {
  const p = { ...model };
  Object.keys(p).forEach(k => { if (p[k] === '') p[k] = null; });
  return p;
}

export default function AdminDefenses({ defenses, students, teachers, rooms, onReload, setMessage, setError }) {
  const [form, setForm] = useState(initialDefense);
  const [fieldError, setFieldError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldError('');
    if (new Date(form.startDateTime) >= new Date(form.endDateTime)) {
      setFieldError("La date de début doit être antérieure à la date de fin.");
      return;
    }
    try {
      if (form.id) {
        await client.put(`/defenses/${form.id}`, normalizePayload(form));
        setMessage("Soutenance mise à jour avec succès.");
      } else {
        await client.post('/defenses', normalizePayload(form));
        setMessage("Soutenance créée avec succès.");
      }
      setForm(initialDefense);
      setShowForm(false);
      onReload();
    } catch (err) { setError(extractApiError(err)); }
  };

  const startEdit = (d) => {
    setForm({
      id:d.id, subject:d.subject, description:d.description,
      studentId:d.studentId, supervisorId:d.supervisorId, roomId:d.roomId,
      startDateTime:toInputDateTime(d.startDateTime),
      endDateTime:toInputDateTime(d.endDateTime),
      status:d.status,
    });
    setShowForm(true);
    setFieldError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette soutenance ? Action irréversible.")) return;
    try {
      await client.delete(`/defenses/${id}`);
      setMessage("Soutenance supprimée.");
      onReload();
    } catch (err) { setError(extractApiError(err)); }
  };

  const handlePublish = async (id) => {
    if (!window.confirm("Publier les résultats de cette soutenance ? Ils seront visibles par l'étudiant.")) return;
    try {
      await client.post(`/publications/defenses/${id}/publish`);
      setMessage("Résultats publiés avec succès.");
      onReload();
    } catch (err) { setError(extractApiError(err)); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Soutenances</h2>
          <p>{defenses.length} soutenance{defenses.length !== 1 ? 's' : ''} enregistrée{defenses.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setForm(initialDefense); setShowForm(v => !v); setFieldError(''); }}>
          {showForm && !form.id ? '✕ Fermer' : '+ Nouvelle soutenance'}
        </button>
      </div>

      {(showForm || form.id) && (
        <div className="card" style={{ marginBottom:'1.25rem' }}>
          <h3>{form.id ? `✏️ Modifier la soutenance #${form.id}` : '+ Nouvelle soutenance'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ marginBottom:'1rem' }}>
              <label className="field" style={{ gridColumn:'1/-1' }}>
                <span>Sujet</span>
                <input value={form.subject} onChange={e => setForm({...form, subject:e.target.value})} required />
              </label>
              <label className="field" style={{ gridColumn:'1/-1' }}>
                <span>Description</span>
                <textarea rows="2" value={form.description} onChange={e => setForm({...form, description:e.target.value})} required />
              </label>
              <label className="field">
                <span>Étudiant</span>
                <select value={form.studentId} onChange={e => setForm({...form, studentId:Number(e.target.value)})} required>
                  <option value="">-- Choisir --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.studentCode} - {s.firstName} {s.lastName}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Encadrant</span>
                <select value={form.supervisorId} onChange={e => setForm({...form, supervisorId:Number(e.target.value)})} required>
                  <option value="">-- Choisir --</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Salle</span>
                <select value={form.roomId} onChange={e => setForm({...form, roomId:Number(e.target.value)})} required>
                  <option value="">-- Choisir --</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.code} - {r.name}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Statut</span>
                <select value={form.status} onChange={e => setForm({...form, status:e.target.value})}>
                  {defenseStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Date début</span>
                <input type="datetime-local" value={form.startDateTime} onChange={e => setForm({...form, startDateTime:e.target.value})} required />
              </label>
              <label className="field">
                <span>Date fin</span>
                <input type="datetime-local" value={form.endDateTime} onChange={e => setForm({...form, endDateTime:e.target.value})} required />
                {fieldError && <span className="field-error">{fieldError}</span>}
              </label>
            </div>
            <div className="actions">
              <button type="submit">{form.id ? 'Mettre à jour' : 'Créer la soutenance'}</button>
              <button type="button" className="secondary" onClick={() => { setForm(initialDefense); setShowForm(false); setFieldError(''); }}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Sujet</th><th>Étudiant</th><th>Encadrant</th><th>Salle</th><th>Créneau</th><th>Statut</th><th>Pub.</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {defenses.length === 0 && (
                <tr><td colSpan="9"><div className="empty-state"><div className="empty-icon">📋</div><p>Aucune soutenance enregistrée.</p></div></td></tr>
              )}
              {defenses.map(d => (
                <tr key={d.id}>
                  <td><span className="badge badge-gray">#{d.id}</span></td>
                  <td><strong style={{ fontSize:'0.85rem' }}>{d.subject}</strong></td>
                  <td style={{ fontSize:'0.82rem' }}>{d.studentName}</td>
                  <td style={{ fontSize:'0.82rem' }}>{d.supervisorName}</td>
                  <td style={{ fontSize:'0.82rem' }}>{d.roomName}</td>
                  <td style={{ fontSize:'0.78rem', color:'var(--text-2)', whiteSpace:'nowrap' }}>
                    {d.startDateTime?.slice(0,16).replace('T',' ')}<br/>→ {d.endDateTime?.slice(0,16).replace('T',' ')}
                  </td>
                  <td><StatusPill status={d.status} /></td>
                  <td>
                    <span className={`badge ${d.publicationStatus === 'PUBLISHED' ? 'badge-green' : 'badge-gray'}`}>
                      {d.publicationStatus === 'PUBLISHED' ? '✓ Publié' : 'Non publié'}
                    </span>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="secondary sm" onClick={() => startEdit(d)}>Éditer</button>
                      <button className="danger sm" onClick={() => handleDelete(d.id)}>Suppr.</button>
                      {d.publicationStatus !== 'PUBLISHED' && (
                        <button className="success sm" onClick={() => handlePublish(d.id)}>Publier</button>
                      )}
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
