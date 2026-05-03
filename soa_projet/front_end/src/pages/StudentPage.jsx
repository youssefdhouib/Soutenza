import { useEffect, useState } from 'react';
import client, { extractApiError } from '../api/client';

export default function StudentPage() {
  const [student, setStudent] = useState(null);
  const [defenses, setDefenses] = useState([]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [studentRes, defensesRes, resultsRes] = await Promise.all([
          client.get('/students/me'),
          client.get('/defenses/mine/student'),
          client.get('/results/my'),
        ]);
        setStudent(studentRes.data);
        setDefenses(defensesRes.data);
        setResults(resultsRes.data);
      } catch (err) {
        setError(extractApiError(err));
      }
    })();
  }, []);

  return (
    <div className="grid cols-2">
      <section className="card">
        <h2>Espace Étudiant</h2>
        {student && (
          <p>
            <strong>{student.firstName} {student.lastName}</strong><br />
            {student.studentCode} - {student.department} - {student.level}
          </p>
        )}
        {error && <div className="notice error">{error}</div>}

        <h3>Mes soutenances planifiées</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Sujet</th><th>Date</th><th>Salle</th><th>Encadrant</th><th>Statut</th></tr>
            </thead>
            <tbody>
              {defenses.map((d) => (
                <tr key={d.id}>
                  <td>{d.subject}</td>
                  <td>{d.startDateTime?.replace('T', ' ')}</td>
                  <td>{d.roomName}</td>
                  <td>{d.supervisorName}</td>
                  <td>{d.status}</td>
                </tr>
              ))}
              {defenses.length === 0 && (
                <tr><td colSpan="5">Aucune soutenance planifiée.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h3>Résultats publiés</h3>
        {results.length === 0 && <p>Aucun résultat publié pour le moment.</p>}
        {results.map((result) => (
          <article key={result.defenseId} className="card" style={{ marginBottom: '0.7rem' }}>
            <h4>{result.subject}</h4>
            <p>
              <strong>Moyenne:</strong> {result.finalAverage ?? '-'} / 20<br />
              <strong>Mention:</strong> {result.finalMention || '-'}<br />
              <strong>Publié le:</strong> {result.publishedAt?.replace('T', ' ') || '-'}
            </p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Jury</th><th>Rôle</th><th>Note</th><th>Commentaire</th></tr>
                </thead>
                <tbody>
                  {(result.grades || []).map((grade, index) => (
                    <tr key={`${result.defenseId}-${index}`}>
                      <td>{grade.teacherName}</td>
                      <td>{grade.juryRole}</td>
                      <td>{grade.score}</td>
                      <td>{grade.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
