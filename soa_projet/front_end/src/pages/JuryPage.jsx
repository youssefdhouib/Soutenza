import { useEffect, useMemo, useState } from 'react';
import client, { extractApiError } from '../api/client';

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

  useEffect(() => {
    loadData();
  }, []);

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
    return grades.find((g) => g.teacherId === teacher.id) || null;
  }, [grades, teacher]);

  useEffect(() => {
    if (ownGrade) {
      setForm({ score: ownGrade.score, comment: ownGrade.comment || '' });
    } else {
      setForm({ score: '', comment: '' });
    }
  }, [ownGrade]);

  const submitGrade = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const payload = { score: Number(form.score), comment: form.comment };
      if (ownGrade) {
        await client.put(`/defenses/${selectedDefenseId}/grades/${ownGrade.id}`, payload);
        setMessage('Note mise à jour.');
      } else {
        await client.post(`/defenses/${selectedDefenseId}/grades`, payload);
        setMessage('Note enregistrée.');
      }
      await loadGrades(selectedDefenseId);
      await loadData();
    } catch (err) {
      setError(extractApiError(err));
    }
  };

  return (
    <div className="grid cols-2">
      <section className="card">
        <h2>Espace Jury</h2>
        <p>Consultez vos soutenances assignées et saisissez vos notes.</p>
        {teacher && (
          <p><strong>Profil:</strong> {teacher.firstName} {teacher.lastName} ({teacher.specialty})</p>
        )}

        <label className="field">
          <span>Soutenance assignée</span>
          <select value={selectedDefenseId} onChange={(e) => loadGrades(e.target.value)}>
            <option value="">Sélectionner</option>
            {defenses.map((d) => (
              <option key={d.id} value={d.id}>
                #{d.id} - {d.subject} ({d.startDateTime?.replace('T', ' ')})
              </option>
            ))}
          </select>
        </label>

        {selectedDefenseId && (
          <form className="grid" onSubmit={submitGrade}>
            <label className="field">
              <span>Note (0-20)</span>
              <input type="number" min="0" max="20" step="0.25" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} required />
            </label>
            <label className="field">
              <span>Commentaire</span>
              <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
            </label>
            <button>{ownGrade ? 'Mettre à jour ma note' : 'Soumettre ma note'}</button>
          </form>
        )}

        {message && <div className="notice success">{message}</div>}
        {error && <div className="notice error">{error}</div>}
      </section>

      <section className="card">
        <h3>Notes de la soutenance</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Jury</th><th>Rôle</th><th>Score</th><th>Commentaire</th></tr>
            </thead>
            <tbody>
              {grades.map((grade) => (
                <tr key={grade.id}>
                  <td>{grade.teacherName}</td>
                  <td>{grade.juryRole}</td>
                  <td>{grade.score}</td>
                  <td>{grade.comment}</td>
                </tr>
              ))}
              {grades.length === 0 && (
                <tr>
                  <td colSpan="4">Aucune note disponible pour cette soutenance.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
