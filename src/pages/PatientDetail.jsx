import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Calendar, MessageCircle, Edit, Trash2, Stethoscope, Droplets, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getAvatarColor, getInitials } from '../data/mockData';
import ReminderModal from '../components/ReminderModal';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPatient, deletePatient, appointments } = useApp();
  const [showReminder, setShowReminder] = useState(false);

  const patient = getPatient(id);

  const today = new Date().toISOString().split('T')[0];
  const patientAppointments = appointments
    .filter(a => a.patientId === id && a.status !== 'cancelled')
    .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));

  const nextAppointment = [...patientAppointments]
    .reverse()
    .find(a => a.date >= today) || null;

  const visitHistory = patientAppointments.filter(a => a.date < today);

  if (!patient) {
    return (
      <div>
        <Link to="/patients" className="back-btn">
          <ArrowLeft size={18} /> Back to Patients
        </Link>
        <div className="empty-state">
          <h3>Patient not found</h3>
          <p>The patient you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const patientIndex = parseInt(patient.id.replace('P', '')) - 1;

  function handleDelete() {
    if (window.confirm(`Remove ${patient.name} from the database?`)) {
      deletePatient(patient.id);
      navigate('/patients');
    }
  }

  return (
    <div>
      <Link to="/patients" className="back-btn">
        <ArrowLeft size={18} /> Back to Patients
      </Link>

      {/* Header */}
      <div className="patient-detail-header">
        <div className="patient-detail-avatar" style={{ background: getAvatarColor(patientIndex) }}>
          {getInitials(patient.name)}
        </div>
        <div className="patient-detail-info">
          <h2>{patient.name}</h2>
          <div className="patient-detail-meta">
            <span>{patient.age} years, {patient.gender}</span>
            <span>•</span>
            <span className={`badge-status ${patient.status}`}>
              <span className="badge-dot"></span>
              {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
            </span>
            <span>•</span>
            <span>{patient.id}</span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button className="btn btn-whatsapp" onClick={() => setShowReminder(true)}>
            <MessageCircle size={18} />
            Send Reminder
          </button>
          <Link to={`/patients/${patient.id}/edit`} className="btn btn-secondary">
            <Edit size={18} />
            Edit
          </Link>
          <button className="btn btn-danger" onClick={handleDelete}>
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="detail-grid">
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '16px' }}>Contact Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="info-item">
              <span className="label"><Phone size={12} style={{ display: 'inline', marginRight: 4 }} />Phone</span>
              <span className="value">+91 {patient.phone.slice(2)}</span>
            </div>
            <div className="info-item">
              <span className="label"><Mail size={12} style={{ display: 'inline', marginRight: 4 }} />Email</span>
              <span className="value">{patient.email}</span>
            </div>
            <div className="info-item">
              <span className="label"><MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />Address</span>
              <span className="value">{patient.address}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '16px' }}>Medical Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="info-item">
              <span className="label"><Stethoscope size={12} style={{ display: 'inline', marginRight: 4 }} />Condition</span>
              <span className="value">{patient.condition}</span>
            </div>
            {patient.treatment && (
              <div className="info-item">
                <span className="label"><Sparkles size={12} style={{ display: 'inline', marginRight: 4 }} />Treatment</span>
                <span className="value" style={{ color: 'var(--green-700)', fontWeight: 600 }}>{patient.treatment}</span>
              </div>
            )}
            <div className="info-item">
              <span className="label"><Droplets size={12} style={{ display: 'inline', marginRight: 4 }} />Blood Group</span>
              <span className="value">{patient.bloodGroup}</span>
            </div>
            <div className="info-item">
              <span className="label"><Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />Next Appointment</span>
              {nextAppointment ? (
                <span className="value" style={{ color: 'var(--green-700)' }}>
                  {new Date(nextAppointment.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' })} · {nextAppointment.time}
                </span>
              ) : (
                <span className="value" style={{ color: 'var(--text-muted)' }}>Not scheduled</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {patient.notes && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 className="card-title" style={{ marginBottom: '12px' }}>Notes</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{patient.notes}</p>
        </div>
      )}

      {/* Visit History */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '16px' }}>Visit History</h3>
        {visitHistory.length > 0 ? (
          <div className="timeline">
            {visitHistory.map((appt) => (
              <div key={appt.id} className="timeline-item">
                <div className="timeline-dot">
                  <Calendar size={14} />
                </div>
                <div className="timeline-content">
                  <div className="timeline-date">
                    {new Date(appt.date + 'T00:00:00').toLocaleDateString('en-IN', {
                      weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </div>
                  <div className="timeline-title">{appt.treatment || 'Appointment'}</div>
                  <div className="timeline-desc">Time: {appt.time}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Calendar size={48} />
            <h3>No visit history</h3>
            <p>Past appointments will appear here once completed.</p>
          </div>
        )}
      </div>

      {/* Reminder Modal */}
      {showReminder && (
        <ReminderModal
          patient={patient}
          onClose={() => setShowReminder(false)}
        />
      )}
    </div>
  );
}
