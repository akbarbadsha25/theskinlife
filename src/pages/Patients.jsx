import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, UserPlus, Phone, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getAvatarColor, getInitials } from '../data/mockData';
import ReminderModal from '../components/ReminderModal';

export default function Patients() {
  const { patients } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [reminderPatient, setReminderPatient] = useState(null);

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    const searchDigits = search.replace(/\D/g, '');
    const matchesSearch = !search ||
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.condition || '').toLowerCase().includes(q) ||
      (p.treatment || '').toLowerCase().includes(q) ||
      (searchDigits.length >= 3 && p.phone.includes(searchDigits));
    const matchesFilter = filter === 'all' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const filters = [
    { key: 'all', label: `All (${patients.length})` },
    { key: 'active', label: `Active (${patients.filter(p => p.status === 'active').length})` },
    { key: 'new', label: `New (${patients.filter(p => p.status === 'new').length})` },
    { key: 'inactive', label: `Inactive (${patients.filter(p => p.status === 'inactive').length})` },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Patients</h1>
          <p className="page-header-subtitle">Manage your patient database</p>
        </div>
        <div className="page-header-actions">
          <Link to="/patients/new" className="btn btn-primary">
            <UserPlus size={18} />
            Add Patient
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="toolbar-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by name, ID, treatment or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-tabs">
            {filters.map(f => (
              <button
                key={f.key}
                className={`filter-tab ${filter === f.key ? 'active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Age / Gender</th>
                <th>Phone</th>
                <th>Treatment</th>
                <th>Last Visit</th>
                <th>Next Visit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((patient, idx) => (
                <tr key={patient.id} className="clickable" onClick={() => navigate(`/patients/${patient.id}`)}>
                  <td>
                    <div className="patient-cell">
                      <div className="patient-avatar" style={{ background: getAvatarColor(idx) }}>
                        {getInitials(patient.name)}
                      </div>
                      <div>
                        <div className="patient-name">{patient.name}</div>
                        <div className="patient-id">{patient.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{patient.age} / {patient.gender.charAt(0)}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 13 }}>
                    +91 {patient.phone.slice(2)}
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--green-700)', fontWeight: 500 }}>{patient.treatment || patient.condition}</td>
                  <td>{patient.lastVisit ? new Date(patient.lastVisit + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                  <td>
                    {patient.nextVisit
                      ? new Date(patient.nextVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'
                    }
                  </td>
                  <td>
                    <span className={`badge-status ${patient.status}`}>
                      <span className="badge-dot"></span>
                      {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-whatsapp"
                      onClick={e => {
                        e.stopPropagation();
                        setReminderPatient(patient);
                      }}
                      title="Send WhatsApp Reminder"
                    >
                      <MessageCircle size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <Search size={48} />
                      <h3>No patients found</h3>
                      <p>Try adjusting your search or filter criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reminder Modal */}
      {reminderPatient && (
        <ReminderModal
          patient={reminderPatient}
          onClose={() => setReminderPatient(null)}
        />
      )}
    </div>
  );
}
