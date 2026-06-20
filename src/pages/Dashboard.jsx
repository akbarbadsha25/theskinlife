import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, CalendarCheck, MessageCircle, TrendingUp, UserPlus, Send, Clock, Bell, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getAvatarColor, getInitials } from '../data/mockData';
import ReminderModal from '../components/ReminderModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { patients, getStats, getAppointmentsForDate, reminders, dismissReminder } = useApp();
  const stats = getStats();
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = getAppointmentsForDate(today);

  const [activeReminder, setActiveReminder] = useState(null);

  const dueReminders = reminders.filter(r => r.status === 'pending' && r.sendOn <= today && r.template !== 'post_visit_followup');

  const recentPatients = [...patients]
    .sort((a, b) => {
      if (!a.lastVisit && !b.lastVisit) return 0;
      if (!a.lastVisit) return 1;
      if (!b.lastVisit) return -1;
      return new Date(b.lastVisit) - new Date(a.lastVisit);
    })
    .slice(0, 5);

  function openReminderModal(pending) {
    const patient = patients.find(p => p.id === pending.patientId);
    if (!patient) return;
    setActiveReminder({ patient, appointmentDate: pending.appointmentDate, scheduledReminderId: pending.id });
  }

  function formatApptDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Dashboard</h1>
          <p className="page-header-subtitle">Welcome back, {currentUser?.name}. Here's your overview for today.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <Link to="/patients" className="stat-card">
          <div className="stat-icon green"><Users size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalPatients}</span>
            <span className="stat-label">Total Patients</span>
            <span className="stat-trend up"><TrendingUp size={12} /> +{stats.newPatients} new</span>
          </div>
        </Link>

        <Link to="/appointments" className="stat-card">
          <div className="stat-icon blue"><CalendarCheck size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{todayAppointments.length}</span>
            <span className="stat-label">Today's Appointments</span>
            <span className="stat-trend up"><Clock size={12} /> Next at 09:00 AM</span>
          </div>
        </Link>

        <Link to="/appointments" className="stat-card">
          <div className="stat-icon orange"><Clock size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.pendingFollowups}</span>
            <span className="stat-label">Pending Follow-ups</span>
            <span className="stat-trend up">This week</span>
          </div>
        </Link>

        <Link to="/reminders" className="stat-card">
          <div className="stat-icon purple" style={{ position: 'relative' }}>
            <MessageCircle size={24} />
            {stats.dueRemindersCount > 0 && (
              <span className="reminder-badge">{stats.dueRemindersCount}</span>
            )}
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalReminders}</span>
            <span className="stat-label">Reminders Sent</span>
            <span className="stat-trend up">Via WhatsApp</span>
          </div>
        </Link>
      </div>

      {/* Due Reminders Alert */}
      {dueReminders.length > 0 && (
        <div className="due-reminders-alert">
          <div className="due-reminders-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={18} color="var(--amber-500)" />
              <span className="due-reminders-title">
                {dueReminders.length} Appointment Reminder{dueReminders.length > 1 ? 's' : ''} Due Today
              </span>
              <span className="due-reminders-sub">Send WhatsApp messages to remind patients about their upcoming visits</span>
            </div>
          </div>
          <div className="due-reminders-list">
            {dueReminders.map(r => (
              <div key={r.id} className="due-reminder-row">
                <div className="due-reminder-patient">
                  <div className="due-reminder-avatar">
                    {r.patientName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="due-reminder-name">{r.patientName}</div>
                    <div className="due-reminder-appt">
                      Appointment: {formatApptDate(r.appointmentDate)} at {r.appointmentTime}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    className="btn btn-whatsapp btn-sm"
                    onClick={() => openReminderModal(r)}
                  >
                    <MessageCircle size={14} />
                    Send WhatsApp
                  </button>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => dismissReminder(r.id)}
                    title="Dismiss"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/patients/new" className="quick-action-card">
          <div className="quick-action-icon" style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}>
            <UserPlus size={22} />
          </div>
          <div className="quick-action-info">
            <h4>Add New Patient</h4>
            <p>Register a new patient record</p>
          </div>
        </Link>

        <Link to="/patients" className="quick-action-card">
          <div className="quick-action-icon" style={{ background: 'var(--blue-100)', color: 'var(--blue-500)' }}>
            <Users size={22} />
          </div>
          <div className="quick-action-info">
            <h4>View All Patients</h4>
            <p>Search and manage patients</p>
          </div>
        </Link>

        <Link to="/reminders" className="quick-action-card">
          <div className="quick-action-icon" style={{ background: 'var(--purple-100)', color: 'var(--purple-500)' }}>
            <Send size={22} />
          </div>
          <div className="quick-action-info">
            <h4>Send Reminder</h4>
            <p>WhatsApp visit reminders</p>
          </div>
        </Link>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="section-header">
            <h3 className="section-title">Recent Patients</h3>
            <Link to="/patients" className="see-all">See all →</Link>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Condition</th>
                  <th className="hide-mobile-col">Last Visit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.map((patient, idx) => (
                  <tr
                    key={patient.id}
                    className="clickable"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
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
                    <td>{patient.condition || '—'}</td>
                    <td className="hide-mobile-col">{patient.lastVisit ? new Date(patient.lastVisit + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
                    <td>
                      <span className={`badge-status ${patient.status}`}>
                        <span className="badge-dot"></span>
                        {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="section-header">
            <h3 className="section-title">Today's Schedule</h3>
            <Link to="/appointments" className="see-all">{todayAppointments.length} appointments →</Link>
          </div>
          {todayAppointments.map((apt) => (
            <div
              key={apt.id}
              className="appointment-card"
              onClick={() => navigate('/appointments')}
              style={{ cursor: 'pointer' }}
            >
              <div className="appointment-time">
                <div className="time">{apt.time}</div>
              </div>
              <div className="appointment-divider" />
              <div className="appointment-info">
                <div className="name">{apt.patientName}</div>
                <div className="type">{apt.treatment}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeReminder && (
        <ReminderModal
          patient={activeReminder.patient}
          appointmentDate={activeReminder.appointmentDate}
          scheduledReminderId={activeReminder.scheduledReminderId}
          onClose={() => setActiveReminder(null)}
        />
      )}
    </div>
  );
}
