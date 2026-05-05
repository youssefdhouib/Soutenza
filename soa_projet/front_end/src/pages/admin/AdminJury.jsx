import { useState } from 'react';
import client, { extractApiError } from '../../api/client';

const juryRoles = ['PRESIDENT','RAPPORTEUR','EXAMINATEUR'];

export default function AdminJury({ defenses, teachers, setMessage, setError }) {
  const [selectedDefenseId, setSelectedDefenseId] = useState('');
  const [juryRows, setJuryRows] = useState([{ teacherId:'', juryRole:'PRESIDENT' }]);
  const [fieldError, setFieldError] = useState('');

  const loadJury = async (defenseId) => {
    setSelectedDefenseId(defenseId);
    setFieldError('');
    if (!defenseId) {
      setJuryRows([{ teacherId:'', juryRole:'PRESIDENT' }]);
      return;
    }
    try {
      const res = await client.get(`/defenses/${defenseId}/jury`);
      if (!res.data.length) {
        setJuryRows([
          { teacherId:'', juryRole:'PRESIDENT' },
          { teacherId:'', juryRole:'RAPPORTEUR' },
          { teacherId:'', juryRole:'EXAMINATEUR' },
        ]);
      } else {
        setJuryRows(res.data.map(item => ({ teacherId: String(item.teacherId), juryRole: item.juryRole })));
      }
    } catch (err) { setError(extractApiError(err)); }
  };

  const saveJury = async () => {
    setFieldError('');
    const hasPresident = juryRows.some(r => r.teacherId && r.juryRole === 'PRESIDENT');
    if (!hasPresident) { setFieldError("Le jury doit comporter au moins un Président."); return; }
    try {
      const payload = juryRows
        .filter(r => r.teacherId)
        .map(r => ({ teacherId: Number(r.teacherId), juryRole: r.juryRole }));
      await client.put(`/defenses/${selectedDefenseId}/jury`, payload);
      setMessage("Jury affecté avec succès.");
    } catch (err) { setError(extractApiError(err)); }
  };

  const updateRow = (idx, field, value) => {
    const copy = [...juryRows];
    copy[idx] = { ...copy[idx], [field]: value };
    setJuryRows(copy);
  };

  const removeRow = (idx) => setJuryRows(juryRows.filter((_, i) => i !== idx));

  const selectedDefense = defenses.find(d => String(d.id) === String(selectedDefenseId));

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Affectation du Jury</h2>
          <p>Sélectionnez une soutenance pour gérer la composition du jury</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom:'1.25rem' }}>
        <h3>Sélectionner une soutenance</h3>
        <label className="field" style={{ maxWidth:'480px' }}>
          <span>Soutenance</span>
          <select value={selectedDefenseId} onChange={e => loadJury(e.target.value)}>
            <option value="">-- Choisir une soutenance --</option>
            {defenses.map(d => (
              <option key={d.id} value={d.id}>#{d.id} — {d.subject} ({d.studentName})</option>
            ))}
          </select>
        </label>
      </div>

      {selectedDefense && (
        <div className="card" style={{ marginBottom:'1.25rem', background:'var(--bg-3)', borderColor:'var(--accent)', borderStyle:'solid' }}>
          <div style={{ display:'flex', gap:'2rem', flexWrap:'wrap', fontSize:'0.875rem' }}>
            <span><strong style={{ color:'var(--text-2)' }}>Sujet : </strong>{selectedDefense.subject}</span>
            <span><strong style={{ color:'var(--text-2)' }}>Étudiant : </strong>{selectedDefense.studentName}</span>
            <span><strong style={{ color:'var(--text-2)' }}>Date : </strong>{selectedDefense.startDateTime?.slice(0,16).replace('T',' ')}</span>
            <span><strong style={{ color:'var(--text-2)' }}>Salle : </strong>{selectedDefense.roomName}</span>
          </div>
        </div>
      )}

      {selectedDefenseId && (
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
            <h3 style={{ margin:0 }}>Membres du jury</h3>
            <button
              className="secondary sm"
              onClick={() => setJuryRows([...juryRows, { teacherId:'', juryRole:'EXAMINATEUR' }])}
            >
              + Ajouter un membre
            </button>
          </div>

          <div className="grid" style={{ gap:'0.75rem', marginBottom:'1.25rem' }}>
            {juryRows.map((row, idx) => (
              <div key={idx} style={{ display:'flex', gap:'0.75rem', alignItems:'flex-end', background:'var(--bg-3)', padding:'1rem', borderRadius:'var(--radius)', border:'1px solid var(--border-light)' }}>
                <label className="field" style={{ flex:1 }}>
                  {idx === 0 && <span>Enseignant</span>}
                  <select value={row.teacherId} onChange={e => updateRow(idx, 'teacherId', e.target.value)}>
                    <option value="">-- Choisir --</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName} ({t.specialty})</option>)}
                  </select>
                </label>
                <label className="field" style={{ width:'180px' }}>
                  {idx === 0 && <span>Rôle</span>}
                  <select value={row.juryRole} onChange={e => updateRow(idx, 'juryRole', e.target.value)}>
                    {juryRoles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </label>
                {juryRows.length > 1 && (
                  <button
                    type="button"
                    className="danger sm"
                    style={{ marginBottom:'1px' }}
                    onClick={() => removeRow(idx)}
                  >✕</button>
                )}
              </div>
            ))}
          </div>

          {fieldError && <div className="field-error" style={{ marginBottom:'0.75rem' }}>⚠ {fieldError}</div>}

          <button className="success" onClick={saveJury}>
            ✓ Enregistrer la composition du jury
          </button>
        </div>
      )}

      {!selectedDefenseId && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">⚖️</div>
            <p>Sélectionnez une soutenance ci-dessus pour gérer son jury.</p>
          </div>
        </div>
      )}
    </div>
  );
}
