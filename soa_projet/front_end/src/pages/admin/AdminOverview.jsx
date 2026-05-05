export default function AdminOverview({ students, teachers, rooms, defenses }) {
  const planned   = defenses.filter(d => d.status === 'PLANNED').length;
  const inProg    = defenses.filter(d => d.status === 'IN_PROGRESS').length;
  const completed = defenses.filter(d => d.status === 'COMPLETED').length;
  const published = defenses.filter(d => d.publicationStatus === 'PUBLISHED').length;

  const stats = [
    { label: 'Étudiants',      value: students.length,  icon: '🎓', color: 'blue'   },
    { label: 'Enseignants',    value: teachers.length,  icon: '👨‍🏫', color: 'purple' },
    { label: 'Salles',         value: rooms.length,     icon: '🏛️',  color: 'amber'  },
    { label: 'Soutenances',    value: defenses.length,  icon: '📋', color: 'blue'   },
    { label: 'Planifiées',     value: planned,          icon: '📅', color: 'amber'  },
    { label: 'En cours',       value: inProg,           icon: '⚡', color: 'red'    },
    { label: 'Terminées',      value: completed,        icon: '✅', color: 'green'  },
    { label: 'Publiées',       value: published,        icon: '📢', color: 'green'  },
  ];

  const recent = [...defenses].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Tableau de bord</h2>
          <p>Vue d'ensemble de la plateforme Soutenza</p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map(s => (
          <div className={`stat-card ${s.color}`} key={s.label}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Soutenances récentes</h3>
        {recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>Aucune soutenance enregistrée.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Sujet</th><th>Étudiant</th><th>Date</th><th>Statut</th><th>Publication</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(d => (
                  <tr key={d.id}>
                    <td>{d.id}</td>
                    <td>{d.subject}</td>
                    <td>{d.studentName}</td>
                    <td style={{ whiteSpace:'nowrap', fontSize:'0.8rem', color:'var(--text-2)' }}>
                      {d.startDateTime?.slice(0,16).replace('T',' ')}
                    </td>
                    <td><StatusPill status={d.status} /></td>
                    <td>
                      <span className={`badge ${d.publicationStatus === 'PUBLISHED' ? 'badge-green' : 'badge-gray'}`}>
                        {d.publicationStatus === 'PUBLISHED' ? 'Publié' : 'Non publié'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function StatusPill({ status }) {
  const map = {
    PLANNED:     { cls: 'status-planned',   label: 'Planifiée'   },
    IN_PROGRESS: { cls: 'status-inprog',    label: 'En cours'    },
    COMPLETED:   { cls: 'status-done',      label: 'Terminée'    },
    CANCELLED:   { cls: 'status-cancelled', label: 'Annulée'     },
    DRAFT:       { cls: 'status-draft',     label: 'Brouillon'   },
  };
  const s = map[status] || { cls: 'status-draft', label: status };
  return <span className={`status-pill ${s.cls}`}>{s.label}</span>;
}
