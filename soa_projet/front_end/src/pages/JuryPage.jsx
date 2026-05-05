import { useEffect, useMemo, useState } from 'react';
import client, { extractApiError } from '../api/client';
import { StatusPill } from './admin/AdminOverview';

export default function JuryPage() {
  const [teacher, setTeacher] = useState(null);
  const [defenses, setDefenses] = useState([]);
  const [selectedDefenseId, setSelectedDefenseId] = useState('');
  const [grades, setGrades] = useState([]);
  const [form, setForm] = useState({ score: '', comment: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [teacherRes, defensesRes] = await Promise.all([
        client.get('/teachers/me'),
        client.get('/defenses/mine/jury'),
      ]);
      setTeacher(teacherRes.data);
      setDefenses(defensesRes.data);
    } catch (err) {
      setError(extractApiError(err));
    }
  };

  useEffect(() => { loadData(); }, []);

  // Auto-dismiss notices
  useEffect(() => {
    if (!message && !error) return;
    const t = setTimeout(() => { setMessage(''); setError(''); }, 4500);
    return () => clearTimeout(t);
  }, [message, error]);

  const loadGrades = async (defenseId) => {
    setSelectedDefenseId(defenseId);
    setMessage('');
    setError('');
    if (!defenseId) {
      setGrades([]);
      setForm({ score: '', comment: '' });
      return;
    }

    try {
      const response = await client.get(`/defenses/${defenseId}/grades`);
      setGrades(response.data);
    } catch (err) {
      setError(extractApiError(err));
    }
  };

  const ownGrade = useMemo(() => {
    if (!teacher) return null;
    return grades.find(g => g.teacherId === teacher.id) || null;
  }, [grades, teacher]);

  useEffect(() => {
    if (ownGrade) setForm({ score: ownGrade.score, comment: ownGrade.comment || '' });
    else setForm({ score: '', comment: '' });
  }, [ownGrade]);

  const submitGrade = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      const payload = { score: Number(form.score), comment: form.comment };
      if (ownGrade) {
        await client.put(`/defenses/${selectedDefenseId}/grades/${ownGrade.id}`, payload);
        setMessage('Note mise à jour avec succès.');
      } else {
        await client.post(`/defenses/${selectedDefenseId}/grades`, payload);
        setMessage('Note enregistrée avec succès.');
      }
      await loadGrades(selectedDefenseId);
      await loadData();
    } catch (err) { setError(extractApiError(err)); }
  };

  const selectedDefense = defenses.find(d => String(d.id) === String(selectedDefenseId));

  return (
    <div style={{ padding:'1.75rem' }}>
      {message && <div className="notice success">{message}</div>}
      {error && <div className="notice error">{error}</div>}

      {/* Profile header */}
      {teacher && (
        <div style={{ display:'flex', alignItems:'center', gap:'1.25rem', marginBottom:'1.75rem' }}>
          <div style={{
            width:'64px', height:'64px', borderRadius:'50%',
            background:'linear-gradient(135deg, var(--accent), var(--purple))',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'1.5rem', fontWeight:'800', color:'white', flexShrink:0,
          }}>
            {teacher.firstName?.[0]}{teacher.lastName?.[0]}
          </div>
          <div>
            <h2 style={{ margin:0, fontSize:'1.4rem' }}>{teacher.firstName} {teacher.lastName}</h2>
            <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.35rem', flexWrap:'wrap' }}>
              <span className="badge badge-purple">{teacher.rank}</span>
              <span className="badge badge-blue">{teacher.specialty}</span>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom:'1.75rem' }}>
        <div className="stat-card blue">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{defenses.length}</div>
          <div className="stat-label">Soutenance{defenses.length !== 1 ? 's' : ''} assignée{defenses.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{defenses.filter(d => d.status === 'PLANNED').length}</div>
          <div className="stat-label">À venir</div>
        </div>
      </div>

      <div className="grid cols-2" style={{ alignItems:'start' }}>
        {/* Left Col: Selection & Evaluation Form */}
        <div className="grid">
          <div className="card">
            <h3>Saisir une évaluation</h3>
            <p style={{ marginBottom:'1.25rem' }}>Sélectionnez une soutenance pour saisir ou modifier votre note.</p>
            <label className="field">
              <span>Soutenance assignée</span>
              <select value={selectedDefenseId} onChange={(e) => loadGrades(e.target.value)}>
                <option value="">-- Choisir une soutenance --</option>
                {defenses.map((d) => (
                  <option key={d.id} value={d.id}>
                    #{d.id} — {d.subject} ({d.studentName})
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedDefense && (
            <div className="card" style={{ background:'var(--bg-3)', borderColor:'var(--accent)' }}>
              <h3 style={{ marginBottom:'1rem' }}>Fiche d'évaluation</h3>
              <form className="grid" onSubmit={submitGrade}>
                <label className="field">
                  <span>Note (0 à 20)</span>
                  <input
                    type="number" min="0" max="20" step="0.25"
                    value={form.score}
                    onChange={(e) => setForm({ ...form, score: e.target.value })}
                    required
                    style={{ fontSize:'1.2rem', fontWeight:700, color:'var(--accent)' }}
                  />
                </label>
                <label className="field">
                  <span>Commentaire ou appréciation</span>
                  <textarea
                    rows="4"
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    placeholder="Saisissez vos remarques..."
                  />
                </label>
                <div className="actions" style={{ marginTop:'0.5rem' }}>
                  <button className="success" style={{ width:'100%', justifyContent:'center', padding:'0.75rem' }}>
                    {ownGrade ? 'Mettre à jour ma note' : 'Soumettre ma note'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Col: Details & Other Grades */}
        <div className="grid">
          {selectedDefenseId ? (
            <>
              {selectedDefense && (
                <div className="card">
                  <h3>Détails de la soutenance</h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                    <div className="info-row"><strong>Sujet</strong> <span>{selectedDefense.subject}</span></div>
                    <div className="info-row"><strong>Étudiant</strong> <span>{selectedDefense.studentName}</span></div>
                    <div className="info-row"><strong>Date</strong> <span>{selectedDefense.startDateTime?.slice(0,16).replace('T',' ')}</span></div>
                    <div className="info-row"><strong>Salle</strong> <span>{selectedDefense.roomName}</span></div>
                    <div className="info-row"><strong>Statut</strong> <span><StatusPill status={selectedDefense.status} /></span></div>
                  </div>
                </div>
              )}

              <div className="card">
                <h3>Notes du jury</h3>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Membre</th><th>Rôle</th><th>Note</th><th>Commentaire</th></tr>
                    </thead>
                    <tbody>
                      {grades.map((g) => (
                        <tr key={g.id} style={g.teacherId === teacher?.id ? { background:'var(--bg-3)' } : {}}>
                          <td>
                            <strong>{g.teacherName}</strong>
                            {g.teacherId === teacher?.id && <span className="badge badge-green" style={{ marginLeft:'0.5rem' }}>Moi</span>}
                          </td>
                          <td><span className={`badge ${g.juryRole === 'PRESIDENT' ? 'badge-blue' : g.juryRole === 'RAPPORTEUR' ? 'badge-purple' : 'badge-gray'}`}>{g.juryRole}</span></td>
                          <td><strong style={{ color:'var(--accent)' }}>{g.score}</strong></td>
                          <td style={{ fontSize:'0.85rem', color:'var(--text-2)' }}>{g.comment || '—'}</td>
                        </tr>
                      ))}
                      {grades.length === 0 && (
                        <tr><td colSpan="4">Aucune note n'a encore été saisie.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
             <div className="card" style={{ height:'100%', minHeight:'300px', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div className="empty-state">
                <div className="empty-icon">⚖️</div>
                <p>Sélectionnez une soutenance pour afficher les détails et les évaluations du jury.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
