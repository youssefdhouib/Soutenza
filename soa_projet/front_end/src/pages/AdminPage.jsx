import { useEffect, useMemo, useState } from 'react';
import client, { extractApiError } from '../api/client';

const defenseStatuses = ['DRAFT', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const juryRoles = ['PRESIDENT', 'RAPPORTEUR', 'EXAMINATEUR'];
const teacherRoles = ['JURY_MEMBER', 'SUPERVISOR'];

const initialStudent = {
  id: null,
  studentCode: '',
  firstName: '',
  lastName: '',
  email: '',
  department: '',
  level: '',
  active: true,
  userId: '',
};

const initialTeacher = {
  id: null,
  firstName: '',
  lastName: '',
  email: '',
  rank: '',
  specialty: '',
  active: true,
  userId: '',
};

const initialRoom = {
  id: null,
  code: '',
  name: '',
  building: '',
  capacity: 30,
  active: true,
};

const initialDefense = {
  id: null,
  subject: '',
  description: '',
  studentId: '',
  supervisorId: '',
  roomId: '',
  startDateTime: '',
  endDateTime: '',
  status: 'PLANNED',
};

const initialRegisterStudent = {
  studentCode: '',
  firstName: '',
  lastName: '',
  email: '',
  department: '',
  level: '',
};

const initialRegisterTeacher = {
  firstName: '',
  lastName: '',
  email: '',
  rank: '',
  specialty: '',
  role: 'JURY_MEMBER',
};

function toInputDateTime(value) {
  if (!value) return '';
  return value.slice(0, 16);
}

function normalizePayload(model) {
  const payload = { ...model };
  Object.keys(payload).forEach((key) => {
    if (payload[key] === '') payload[key] = null;
  });
  return payload;
}


export default function AdminPage() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [defenses, setDefenses] = useState([]);

  const [studentForm, setStudentForm] = useState(initialStudent);
  const [teacherForm, setTeacherForm] = useState(initialTeacher);
  const [roomForm, setRoomForm] = useState(initialRoom);
  const [defenseForm, setDefenseForm] = useState(initialDefense);

  const [registerStudentForm, setRegisterStudentForm] = useState(initialRegisterStudent);
  const [registerTeacherForm, setRegisterTeacherForm] = useState(initialRegisterTeacher);

  const [selectedDefenseForJury, setSelectedDefenseForJury] = useState('');
  const [juryRows, setJuryRows] = useState([{ teacherId: '', juryRole: 'PRESIDENT' }]);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const supervisors = useMemo(() => teachers, [teachers]);


  const clearNotice = () => {
    setMessage('');
    setError('');
  };

  const loadAll = async () => {
    clearNotice();
    try {
      const [studentsRes, teachersRes, roomsRes, defensesRes] = await Promise.all([
        client.get('/students'),
        client.get('/teachers'),
        client.get('/rooms'),
        client.get('/defenses'),
      ]);
      setStudents(studentsRes.data);
      setTeachers(teachersRes.data);
      setRooms(roomsRes.data);
      setDefenses(defensesRes.data);
    } catch (err) {
      setError(extractApiError(err));
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    clearNotice();
    try {
      const payload = normalizePayload(studentForm);
      if (studentForm.id) {
        await client.put(`/students/${studentForm.id}`, payload);
        setMessage('Étudiant mis à jour.');
      } else {
        await client.post('/students', payload);
        setMessage('Étudiant créé.');
      }
      setStudentForm(initialStudent);
      await loadAll();
    } catch (err) {
      setError(extractApiError(err));
    }
  };

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    clearNotice();
    try {
      const payload = normalizePayload(teacherForm);
      if (teacherForm.id) {
        await client.put(`/teachers/${teacherForm.id}`, payload);
        setMessage('Enseignant mis à jour.');
      } else {
        await client.post('/teachers', payload);
        setMessage('Enseignant créé.');
      }
      setTeacherForm(initialTeacher);
      await loadAll();
    } catch (err) {
      setError(extractApiError(err));
    }
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    clearNotice();
    try {
      const payload = normalizePayload(roomForm);
      if (roomForm.id) {
        await client.put(`/rooms/${roomForm.id}`, payload);
        setMessage('Salle mise à jour.');
      } else {
        await client.post('/rooms', payload);
        setMessage('Salle créée.');
      }
      setRoomForm(initialRoom);
      await loadAll();
    } catch (err) {
      setError(extractApiError(err));
    }
  };

  const handleDefenseSubmit = async (e) => {
    e.preventDefault();
    clearNotice();
    try {
      const payload = normalizePayload(defenseForm);
      if (defenseForm.id) {
        await client.put(`/defenses/${defenseForm.id}`, payload);
        setMessage('Soutenance mise à jour.');
      } else {
        await client.post('/defenses', payload);
        setMessage('Soutenance créée.');
      }
      setDefenseForm(initialDefense);
      await loadAll();
    } catch (err) {
      setError(extractApiError(err));
    }
  };

  const deleteItem = async (type, id) => {
    if (!window.confirm('Confirmer la suppression ?')) return;
    clearNotice();
    try {
      await client.delete(`/${type}/${id}`);
      setMessage('Suppression effectuée.');
      await loadAll();
    } catch (err) {
      setError(extractApiError(err));
    }
  };

  const editDefense = (defense) => {
    setDefenseForm({
      id: defense.id,
      subject: defense.subject,
      description: defense.description,
      studentId: defense.studentId,
      supervisorId: defense.supervisorId,
      roomId: defense.roomId,
      startDateTime: toInputDateTime(defense.startDateTime),
      endDateTime: toInputDateTime(defense.endDateTime),
      status: defense.status,
    });
  };

  const loadJuryForDefense = async (defenseId) => {
    setSelectedDefenseForJury(defenseId);
    clearNotice();
    if (!defenseId) {
      setJuryRows([{ teacherId: '', juryRole: 'PRESIDENT' }]);
      return;
    }
    try {
      const response = await client.get(`/defenses/${defenseId}/jury`);
      if (!response.data.length) {
        setJuryRows([
          { teacherId: '', juryRole: 'PRESIDENT' },
          { teacherId: '', juryRole: 'RAPPORTEUR' },
          { teacherId: '', juryRole: 'EXAMINATEUR' },
        ]);
      } else {
        setJuryRows(response.data.map((item) => ({ teacherId: String(item.teacherId), juryRole: item.juryRole })));
      }
    } catch (err) {
      setError(extractApiError(err));
    }
  };

  const saveJuryAssignments = async () => {
    clearNotice();
    try {
      const payload = juryRows
        .filter((row) => row.teacherId)
        .map((row) => ({ teacherId: Number(row.teacherId), juryRole: row.juryRole }));
      await client.put(`/defenses/${selectedDefenseForJury}/jury`, payload);
      setMessage('Affectation jury mise à jour.');
      await loadAll();
      await loadJuryForDefense(selectedDefenseForJury);
    } catch (err) {
      setError(extractApiError(err));
    }
  };

  const publishDefense = async (defenseId) => {
    clearNotice();
    try {
      await client.post(`/publications/defenses/${defenseId}/publish`);
      setMessage('Résultat publié avec succès.');
      await loadAll();
    } catch (err) {
      setError(extractApiError(err));
    }
  };

  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    clearNotice();
    try {
      const res = await client.post('/auth/register/student', registerStudentForm);
      setMessage(res.data.message);
      setRegisterStudentForm(initialRegisterStudent);
      await loadAll();
    } catch (err) {
      setError(extractApiError(err));
    }
  };

  const handleRegisterTeacher = async (e) => {
    e.preventDefault();
    clearNotice();
    try {
      const res = await client.post('/auth/register/teacher', registerTeacherForm);
      setMessage(res.data.message);
      setRegisterTeacherForm(initialRegisterTeacher);
      await loadAll();
    } catch (err) {
      setError(extractApiError(err));
    }
  };

  return (
    <div className="grid">
      {message && <div className="notice success">{message}</div>}
      {error && <div className="notice error">{error}</div>}

      <section className="card">
        <h2>Tableau de bord Admin</h2>
        <p>Gestion complète des étudiants, enseignants, salles, soutenances, jurys et publication des résultats.</p>
      </section>

      {/* ── Créer des comptes (avec envoi d'email automatique) ── */}
      <section className="grid cols-2">
        <article className="card">
          <h3>✉️ Créer un compte étudiant</h3>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.75rem' }}>
            Un mot de passe temporaire sera généré et envoyé par email à l'étudiant.
          </p>
          <form className="grid" onSubmit={handleRegisterStudent}>
            <div className="form-grid">
              <label className="field"><span>Code étudiant</span><input value={registerStudentForm.studentCode} onChange={(e) => setRegisterStudentForm({ ...registerStudentForm, studentCode: e.target.value })} required /></label>
              <label className="field"><span>Prénom</span><input value={registerStudentForm.firstName} onChange={(e) => setRegisterStudentForm({ ...registerStudentForm, firstName: e.target.value })} required /></label>
              <label className="field"><span>Nom</span><input value={registerStudentForm.lastName} onChange={(e) => setRegisterStudentForm({ ...registerStudentForm, lastName: e.target.value })} required /></label>
              <label className="field"><span>Email</span><input type="email" value={registerStudentForm.email} onChange={(e) => setRegisterStudentForm({ ...registerStudentForm, email: e.target.value })} required /></label>
              <label className="field"><span>Département</span><input value={registerStudentForm.department} onChange={(e) => setRegisterStudentForm({ ...registerStudentForm, department: e.target.value })} required /></label>
              <label className="field"><span>Niveau</span><input value={registerStudentForm.level} onChange={(e) => setRegisterStudentForm({ ...registerStudentForm, level: e.target.value })} required /></label>
            </div>
            <div className="actions">
              <button>Créer et envoyer l'email</button>
              <button className="secondary" type="button" onClick={() => setRegisterStudentForm(initialRegisterStudent)}>Réinitialiser</button>
            </div>
          </form>
        </article>

        <article className="card">
          <h3>✉️ Créer un compte enseignant / jury</h3>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.75rem' }}>
            Un mot de passe temporaire sera généré et envoyé par email à l'enseignant.
          </p>
          <form className="grid" onSubmit={handleRegisterTeacher}>
            <div className="form-grid">
              <label className="field"><span>Prénom</span><input value={registerTeacherForm.firstName} onChange={(e) => setRegisterTeacherForm({ ...registerTeacherForm, firstName: e.target.value })} required /></label>
              <label className="field"><span>Nom</span><input value={registerTeacherForm.lastName} onChange={(e) => setRegisterTeacherForm({ ...registerTeacherForm, lastName: e.target.value })} required /></label>
              <label className="field"><span>Email</span><input type="email" value={registerTeacherForm.email} onChange={(e) => setRegisterTeacherForm({ ...registerTeacherForm, email: e.target.value })} required /></label>
              <label className="field"><span>Grade</span><input value={registerTeacherForm.rank} onChange={(e) => setRegisterTeacherForm({ ...registerTeacherForm, rank: e.target.value })} required /></label>
              <label className="field"><span>Spécialité</span><input value={registerTeacherForm.specialty} onChange={(e) => setRegisterTeacherForm({ ...registerTeacherForm, specialty: e.target.value })} required /></label>
              <label className="field">
                <span>Rôle</span>
                <select value={registerTeacherForm.role} onChange={(e) => setRegisterTeacherForm({ ...registerTeacherForm, role: e.target.value })}>
                  {teacherRoles.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
            </div>
            <div className="actions">
              <button>Créer et envoyer l'email</button>
              <button className="secondary" type="button" onClick={() => setRegisterTeacherForm(initialRegisterTeacher)}>Réinitialiser</button>
            </div>
          </form>
        </article>
      </section>

      <section className="grid cols-2">
        <article className="card">
          <h3>Étudiants</h3>
          <form className="grid" onSubmit={handleStudentSubmit}>
            <div className="form-grid">
              <label className="field"><span>Code</span><input value={studentForm.studentCode} onChange={(e) => setStudentForm({ ...studentForm, studentCode: e.target.value })} required /></label>
              <label className="field"><span>Prénom</span><input value={studentForm.firstName} onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })} required /></label>
              <label className="field"><span>Nom</span><input value={studentForm.lastName} onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })} required /></label>
              <label className="field"><span>Email</span><input type="email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} required /></label>
              <label className="field"><span>Département</span><input value={studentForm.department} onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })} required /></label>
              <label className="field"><span>Niveau</span><input value={studentForm.level} onChange={(e) => setStudentForm({ ...studentForm, level: e.target.value })} required /></label>
              <label className="field"><span>ID Utilisateur (optionnel)</span><input type="number" value={studentForm.userId} onChange={(e) => setStudentForm({ ...studentForm, userId: e.target.value })} placeholder="Laisser vide pour ne pas lier" /></label>
            </div>
            <div className="actions">
              <button>{studentForm.id ? 'Mettre à jour' : 'Créer'}</button>
              <button className="secondary" type="button" onClick={() => setStudentForm(initialStudent)}>Réinitialiser</button>
            </div>
          </form>
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Code</th><th>Nom</th><th>Email</th><th>Action</th></tr></thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.studentCode}</td>
                    <td>{s.firstName} {s.lastName}</td>
                    <td>{s.email}</td>
                    <td className="actions">
                      <button type="button" onClick={() => setStudentForm({ ...s, userId: s.userId || '' })}>Éditer</button>
                      <button type="button" className="danger" onClick={() => deleteItem('students', s.id)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card">
          <h3>Enseignants</h3>
          <form className="grid" onSubmit={handleTeacherSubmit}>
            <div className="form-grid">
              <label className="field"><span>Prénom</span><input value={teacherForm.firstName} onChange={(e) => setTeacherForm({ ...teacherForm, firstName: e.target.value })} required /></label>
              <label className="field"><span>Nom</span><input value={teacherForm.lastName} onChange={(e) => setTeacherForm({ ...teacherForm, lastName: e.target.value })} required /></label>
              <label className="field"><span>Email</span><input type="email" value={teacherForm.email} onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })} required /></label>
              <label className="field"><span>Grade</span><input value={teacherForm.rank} onChange={(e) => setTeacherForm({ ...teacherForm, rank: e.target.value })} required /></label>
              <label className="field"><span>Spécialité</span><input value={teacherForm.specialty} onChange={(e) => setTeacherForm({ ...teacherForm, specialty: e.target.value })} required /></label>
              <label className="field"><span>ID Utilisateur (optionnel)</span><input type="number" value={teacherForm.userId} onChange={(e) => setTeacherForm({ ...teacherForm, userId: e.target.value })} /></label>
            </div>
            <div className="actions">
              <button>{teacherForm.id ? 'Mettre à jour' : 'Créer'}</button>
              <button className="secondary" type="button" onClick={() => setTeacherForm(initialTeacher)}>Réinitialiser</button>
            </div>
          </form>
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Nom</th><th>Email</th><th>Spécialité</th><th>Action</th></tr></thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.firstName} {t.lastName}</td>
                    <td>{t.email}</td>
                    <td>{t.specialty}</td>
                    <td className="actions">
                      <button type="button" onClick={() => setTeacherForm({ ...t, userId: t.userId || '' })}>Éditer</button>
                      <button type="button" className="danger" onClick={() => deleteItem('teachers', t.id)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="grid cols-2">
        <article className="card">
          <h3>Salles</h3>
          <form className="grid" onSubmit={handleRoomSubmit}>
            <div className="form-grid">
              <label className="field"><span>Code</span><input value={roomForm.code} onChange={(e) => setRoomForm({ ...roomForm, code: e.target.value })} required /></label>
              <label className="field"><span>Nom</span><input value={roomForm.name} onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })} required /></label>
              <label className="field"><span>Bâtiment</span><input value={roomForm.building} onChange={(e) => setRoomForm({ ...roomForm, building: e.target.value })} required /></label>
              <label className="field"><span>Capacité</span><input type="number" min="1" value={roomForm.capacity} onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })} required /></label>
            </div>
            <div className="actions">
              <button>{roomForm.id ? 'Mettre à jour' : 'Créer'}</button>
              <button className="secondary" type="button" onClick={() => setRoomForm(initialRoom)}>Réinitialiser</button>
            </div>
          </form>
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Code</th><th>Nom</th><th>Bâtiment</th><th>Action</th></tr></thead>
              <tbody>
                {rooms.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.code}</td>
                    <td>{r.name}</td>
                    <td>{r.building}</td>
                    <td className="actions">
                      <button type="button" onClick={() => setRoomForm({ ...r })}>Éditer</button>
                      <button type="button" className="danger" onClick={() => deleteItem('rooms', r.id)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card">
          <h3>Soutenances</h3>
          <form className="grid" onSubmit={handleDefenseSubmit}>
            <div className="form-grid">
              <label className="field"><span>Sujet</span><input value={defenseForm.subject} onChange={(e) => setDefenseForm({ ...defenseForm, subject: e.target.value })} required /></label>
              <label className="field"><span>Description</span><textarea value={defenseForm.description} onChange={(e) => setDefenseForm({ ...defenseForm, description: e.target.value })} required /></label>
              <label className="field"><span>Étudiant</span>
                <select value={defenseForm.studentId} onChange={(e) => setDefenseForm({ ...defenseForm, studentId: Number(e.target.value) })} required>
                  <option value="">--</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.studentCode} - {s.firstName} {s.lastName}</option>)}
                </select>
              </label>
              <label className="field"><span>Encadrant</span>
                <select value={defenseForm.supervisorId} onChange={(e) => setDefenseForm({ ...defenseForm, supervisorId: Number(e.target.value) })} required>
                  <option value="">--</option>
                  {supervisors.map((t) => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                </select>
              </label>
              <label className="field"><span>Salle</span>
                <select value={defenseForm.roomId} onChange={(e) => setDefenseForm({ ...defenseForm, roomId: Number(e.target.value) })} required>
                  <option value="">--</option>
                  {rooms.map((r) => <option key={r.id} value={r.id}>{r.code} - {r.name}</option>)}
                </select>
              </label>
              <label className="field"><span>Début</span><input type="datetime-local" value={defenseForm.startDateTime} onChange={(e) => setDefenseForm({ ...defenseForm, startDateTime: e.target.value })} required /></label>
              <label className="field"><span>Fin</span><input type="datetime-local" value={defenseForm.endDateTime} onChange={(e) => setDefenseForm({ ...defenseForm, endDateTime: e.target.value })} required /></label>
              <label className="field"><span>Statut</span>
                <select value={defenseForm.status} onChange={(e) => setDefenseForm({ ...defenseForm, status: e.target.value })}>
                  {defenseStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
            </div>
            <div className="actions">
              <button>{defenseForm.id ? 'Mettre à jour' : 'Créer'}</button>
              <button className="secondary" type="button" onClick={() => setDefenseForm(initialDefense)}>Réinitialiser</button>
            </div>
          </form>
        </article>
      </section>

      <section className="card">
        <h3>Liste des soutenances</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Sujet</th><th>Étudiant</th><th>Encadrant</th><th>Salle</th><th>Créneau</th><th>Statut</th><th>Publication</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {defenses.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td>{d.subject}</td>
                  <td>{d.studentName}</td>
                  <td>{d.supervisorName}</td>
                  <td>{d.roomName}</td>
                  <td>{d.startDateTime?.replace('T', ' ')} → {d.endDateTime?.replace('T', ' ')}</td>
                  <td>{d.status}</td>
                  <td>{d.publicationStatus}</td>
                  <td className="actions">
                    <button type="button" onClick={() => editDefense(d)}>Éditer</button>
                    <button type="button" className="danger" onClick={() => deleteItem('defenses', d.id)}>Supprimer</button>
                    {d.publicationStatus !== 'PUBLISHED' && (
                      <button type="button" className="success" onClick={() => publishDefense(d.id)}>Publier</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h3>Affectation du jury</h3>
        <div className="form-grid">
          <label className="field">
            <span>Soutenance</span>
            <select value={selectedDefenseForJury} onChange={(e) => loadJuryForDefense(e.target.value)}>
              <option value="">Sélectionner</option>
              {defenses.map((d) => (
                <option key={d.id} value={d.id}>#{d.id} - {d.subject}</option>
              ))}
            </select>
          </label>
        </div>

        {selectedDefenseForJury && (
          <>
            <div className="grid" style={{ marginTop: '0.75rem' }}>
              {juryRows.map((row, idx) => (
                <div key={idx} className="form-grid">
                  <label className="field">
                    <span>Enseignant</span>
                    <select
                      value={row.teacherId}
                      onChange={(e) => {
                        const copy = [...juryRows];
                        copy[idx].teacherId = e.target.value;
                        setJuryRows(copy);
                      }}
                    >
                      <option value="">--</option>
                      {teachers.map((t) => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                    </select>
                  </label>
                  <label className="field">
                    <span>Rôle</span>
                    <select
                      value={row.juryRole}
                      onChange={(e) => {
                        const copy = [...juryRows];
                        copy[idx].juryRole = e.target.value;
                        setJuryRows(copy);
                      }}
                    >
                      {juryRoles.map((role) => <option key={role} value={role}>{role}</option>)}
                    </select>
                  </label>
                </div>
              ))}
            </div>
            <div className="actions" style={{ marginTop: '0.75rem' }}>
              <button type="button" onClick={() => setJuryRows([...juryRows, { teacherId: '', juryRole: 'EXAMINATEUR' }])}>Ajouter membre</button>
              <button type="button" className="success" onClick={saveJuryAssignments}>Enregistrer jury</button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
