import { useEffect, useState } from 'react';
import client, { extractApiError } from '../api/client';
import { StatusPill } from './admin/AdminOverview';

export default function StudentPage() {
  const [student, setStudent]   = useState(null);
  const [defenses, setDefenses] = useState([]);
  const [results, setResults]   = useState([]);
  const [error, setError]       = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [sr, dr, rr] = await Promise.all([
          client.get('/students/me'),
          client.get('/defenses/mine/student'),
          client.get('/results/my'),
        ]);
        setStudent(sr.data);
        setDefenses(dr.data);
        setResults(rr.data);
      } catch (err) { setError(extractApiError(err)); }
    })();
  }, []);

  return (
    <div style={{ padding:'1.75rem' }}>
      {error && <div className="notice error">{error}</div>}

      {/* Profile header */}
      {student && (
        <div style={{ display:'flex', alignItems:'center', gap:'1.25rem', marginBottom:'1.75rem' }}>
          <div style={{
            width:'64px', height:'64px', borderRadius:'50%',
            background:'linear-gradient(135deg, var(--accent), var(--purple))',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'1.5rem', fontWeight:'800', color:'white', flexShrink:0,
          }}>
            {student.firstName?.[0]}{student.lastName?.[0]}
          </div>
          <div>
            <h2 style={{ margin:0, fontSize:'1.4rem' }}>{student.firstName} {student.lastName}</h2>
            <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.35rem', flexWrap:'wrap' }}>
              <span className="badge badge-blue">{student.studentCode}</span>
              <span className="badge badge-purple">{student.department}</span>
              <span className="badge badge-amber">{student.level}</span>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom:'1.75rem' }}>
        <div className="stat-card blue">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{defenses.length}</div>
          <div className="stat-label">Soutenance{defenses.length !== 1 ? 's' : ''} planifiée{defenses.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">📢</div>
          <div className="stat-value">{results.length}</div>
          <div className="stat-label">Résultat{results.length !== 1 ? 's' : ''} publié{results.length !== 1 ? 's' : ''}</div>
        </div>
        {results.length > 0 && (
          <div className="stat-card purple">
            <div className="stat-icon">🏆</div>
            <div className="stat-value">{results[0].finalAverage ?? '—'}</div>
            <div className="stat-label">Dernière moyenne / 20</div>
          </div>
        )}
      </div>

      {/* Defenses table */}
      <div className="card" style={{ marginBottom:'1.25rem' }}>
        <h3>📅 Mes soutenances planifiées</h3>
        {defenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <p>Aucune soutenance planifiée pour le moment.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Sujet</th><th>Date &amp; heure</th><th>Salle</th><th>Encadrant</th><th>Statut</th></tr>
              </thead>
              <tbody>
                {defenses.map(d => (
                  <tr key={d.id}>
                    <td><strong>{d.subject}</strong></td>
                    <td style={{ fontSize:'0.82rem', color:'var(--text-2)', whiteSpace:'nowrap' }}>
                      {d.startDateTime?.slice(0,16).replace('T',' ')}
                    </td>
                    <td>{d.roomName}</td>
                    <td>{d.supervisorName}</td>
                    <td><StatusPill status={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results */}
      <div>
        <h3 style={{ marginBottom:'1rem' }}>🏆 Résultats publiés</h3>
        {results.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">⏳</div>
              <p>Aucun résultat publié pour le moment. Revenez après votre soutenance.</p>
            </div>
          </div>
        ) : results.map(result => (
          <div className="result-card" key={result.defenseId}>
            <div className="result-header">
              <div>
                <h3 style={{ margin:0, marginBottom:'0.25rem' }}>{result.subject}</h3>
                <span style={{ fontSize:'0.8rem', color:'var(--text-2)' }}>
                  Publié le {result.publishedAt?.slice(0,10) || '—'}
                </span>
              </div>
              <div style={{ textAlign:'right' }}>
                <div className="result-score">{result.finalAverage ?? '—'}<span style={{ fontSize:'1rem', fontWeight:500 }}>/20</span></div>
                {result.finalMention && (
                  <span className="badge badge-green" style={{ marginTop:'0.25rem' }}>{result.finalMention}</span>
                )}
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Membre du jury</th><th>Rôle</th><th>Note</th><th>Commentaire</th></tr>
                </thead>
                <tbody>
                  {(result.grades || []).map((g, i) => (
                    <tr key={i}>
                      <td><strong>{g.teacherName}</strong></td>
                      <td><span className={`badge ${g.juryRole === 'PRESIDENT' ? 'badge-blue' : g.juryRole === 'RAPPORTEUR' ? 'badge-purple' : 'badge-gray'}`}>{g.juryRole}</span></td>
                      <td><strong style={{ color:'var(--accent)', fontSize:'1.05rem' }}>{g.score}</strong></td>
                      <td style={{ color:'var(--text-2)', fontSize:'0.85rem' }}>{g.comment || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
