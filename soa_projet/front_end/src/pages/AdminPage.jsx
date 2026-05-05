import { useEffect, useState } from 'react';
import client, { extractApiError } from '../api/client';
import AdminOverview   from './admin/AdminOverview';
import AdminStudents   from './admin/AdminStudents';
import AdminTeachers   from './admin/AdminTeachers';
import AdminRooms      from './admin/AdminRooms';
import AdminDefenses   from './admin/AdminDefenses';
import AdminJury       from './admin/AdminJury';

const NAV = [
  { id:'overview',  icon:'📊', label:'Vue d\'ensemble' },
  { id:'students',  icon:'🎓', label:'Étudiants',    section:'GESTION' },
  { id:'teachers',  icon:'👨‍🏫', label:'Enseignants',  section:'GESTION' },
  { id:'rooms',     icon:'🏛️',  label:'Salles',       section:'GESTION' },
  { id:'defenses',  icon:'📋', label:'Soutenances',  section:'PLANIFICATION' },
  { id:'jury',      icon:'⚖️',  label:'Jury',         section:'PLANIFICATION' },
];

export default function AdminPage() {
  const [page, setPage]       = useState('overview');
  const [students, setStudents]   = useState([]);
  const [teachers, setTeachers]   = useState([]);
  const [rooms, setRooms]         = useState([]);
  const [defenses, setDefenses]   = useState([]);
  const [message, setMessage]     = useState('');
  const [error, setError]         = useState('');

  const loadAll = async () => {
    try {
      const [sr, tr, rr, dr] = await Promise.all([
        client.get('/students'),
        client.get('/teachers'),
        client.get('/rooms'),
        client.get('/defenses'),
      ]);
      setStudents(sr.data);
      setTeachers(tr.data);
      setRooms(rr.data);
      setDefenses(dr.data);
    } catch (err) {
      setError(extractApiError(err));
    }
  };

  useEffect(() => { loadAll(); }, []);

  // Auto-dismiss notices
  useEffect(() => {
    if (!message && !error) return;
    const t = setTimeout(() => { setMessage(''); setError(''); }, 4500);
    return () => clearTimeout(t);
  }, [message, error]);

  const sharedProps = { onReload: loadAll, setMessage, setError };

  const renderPage = () => {
    switch (page) {
      case 'overview':  return <AdminOverview students={students} teachers={teachers} rooms={rooms} defenses={defenses} />;
      case 'students':  return <AdminStudents students={students} {...sharedProps} />;
      case 'teachers':  return <AdminTeachers teachers={teachers} {...sharedProps} />;
      case 'rooms':     return <AdminRooms    rooms={rooms}       {...sharedProps} />;
      case 'defenses':  return <AdminDefenses defenses={defenses} students={students} teachers={teachers} rooms={rooms} {...sharedProps} />;
      case 'jury':      return <AdminJury     defenses={defenses} teachers={teachers} setMessage={setMessage} setError={setError} />;
      default:          return null;
    }
  };

  // Sidebar badge counts
  const counts = { students: students.length, teachers: teachers.length, rooms: rooms.length, defenses: defenses.length };

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        {NAV.map((item, i) => {
          const prevSection = NAV[i - 1]?.section;
          const showLabel = item.section && item.section !== prevSection;
          return (
            <div key={item.id}>
              {showLabel && (
                <div className="sidebar-section-label">{item.section}</div>
              )}
              <button
                className={`sidebar-item ${page === item.id ? 'active' : ''}`}
                onClick={() => setPage(item.id)}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
                {counts[item.id] !== undefined && (
                  <span className="sidebar-badge">{counts[item.id]}</span>
                )}
              </button>
            </div>
          );
        })}
      </aside>

      {/* Main content */}
      <div className="admin-content">
        {message && <div className="notice success">{message}</div>}
        {error   && <div className="notice error">{error}</div>}
        {renderPage()}
      </div>
    </div>
  );
}
