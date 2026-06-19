import { useState } from 'react';
import { MessageCircle, Search, ExternalLink, Clock, Bell, X, CalendarClock, HeartHandshake } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ReminderModal from '../components/ReminderModal';

export default function Reminders() {
  const { reminders, patients, dismissReminder } = useApp();
  const [reminderPatient, setReminderPatient] = useState(null);
  const [activeScheduled, setActiveScheduled] = useState(null);
  const [search, setSearch] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const dueReminders = reminders.filter(r => r.status === 'pending' && r.sendOn <= today && r.template !== 'post_visit_followup');
  const dueFollowUps = reminders.filter(r => r.status === 'pending' && r.sendOn <= today && r.template === 'post_visit_followup');
  const upcomingReminders = reminders.filter(r => r.status === 'pending' && r.sendOn > today && r.template !== 'post_visit_followup');
  const sentReminders = reminders.filter(r => r.status === 'sent');

  const filteredSent = sentReminders.filter(r =>
    r.patientName.toLowerCase().includes(search.toLowerCase()) ||
    r.phone.includes(search)
  );

  function formatSentTime(isoString) {
    return new Date(isoString).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  function openScheduledModal(pending) {
    const patient = patients.find(p => p.id === pending.patientId);
    if (!patient) return;
    setActiveScheduled({
      patient,
      appointmentDate: pending.appointmentDate,
      scheduledReminderId: pending.id,
      defaultTemplate: pending.template || 'appointment_reminder',
    });
  }

  const hasPending = dueReminders.length > 0 || dueFollowUps.length > 0 || upcomingReminders.length > 0;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Reminders</h1>
          <p className="page-header-subtitle">Scheduled & sent WhatsApp visit reminders</p>
        </div>
        <div className="page-header-actions">
          <button
            className="btn btn-whatsapp"
            onClick={() => { if (patients.length > 0) setReminderPatient(patients[0]); }}
          >
            <MessageCircle size={18} />
            New Reminder
          </button>
        </div>
      </div>

      {/* Scheduled Reminders Section */}
      {hasPending && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarClock size={17} color="var(--amber-500)" />
            Scheduled Reminders
          </h3>

          {/* Due Today / Overdue */}
          {dueReminders.length > 0 && (
            <div className="scheduled-reminders-card due">
              <div className="scheduled-section-label">
                <Bell size={13} />
                Due Today — {dueReminders.length} reminder{dueReminders.length > 1 ? 's' : ''}
              </div>
              {dueReminders.map(r => (
                <div key={r.id} className="scheduled-reminder-row">
                  <div className="scheduled-reminder-info">
                    <div className="scheduled-reminder-name">{r.patientName}</div>
                    <div className="scheduled-reminder-meta">
                      Appointment: {formatDate(r.appointmentDate)} at {r.appointmentTime}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      className="btn btn-whatsapp btn-sm"
                      onClick={() => openScheduledModal(r)}
                    >
                      <MessageCircle size={13} />
                      Send Now
                    </button>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => dismissReminder(r.id)}
                      title="Dismiss"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Post-Visit Follow-ups Due */}
          {dueFollowUps.length > 0 && (
            <div className="scheduled-reminders-card" style={{ marginTop: dueReminders.length > 0 ? '12px' : 0, borderLeft: '3px solid #25D366' }}>
              <div className="scheduled-section-label" style={{ color: '#25D366' }}>
                <HeartHandshake size={13} />
                Post-Visit Follow-ups — {dueFollowUps.length} due today
              </div>
              {dueFollowUps.map(r => (
                <div key={r.id} className="scheduled-reminder-row">
                  <div className="scheduled-reminder-info">
                    <div className="scheduled-reminder-name">{r.patientName}</div>
                    <div className="scheduled-reminder-meta">
                      Visited today — Send a follow-up WhatsApp message
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      className="btn btn-whatsapp btn-sm"
                      onClick={() => openScheduledModal(r)}
                    >
                      <MessageCircle size={13} />
                      Send Follow-up
                    </button>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => dismissReminder(r.id)}
                      title="Dismiss"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming */}
          {upcomingReminders.length > 0 && (
            <div className="scheduled-reminders-card upcoming" style={{ marginTop: dueReminders.length > 0 ? '12px' : 0 }}>
              <div className="scheduled-section-label upcoming">
                <Clock size={13} />
                Upcoming — {upcomingReminders.length} scheduled
              </div>
              {upcomingReminders.map(r => (
                <div key={r.id} className="scheduled-reminder-row">
                  <div className="scheduled-reminder-info">
                    <div className="scheduled-reminder-name">{r.patientName}</div>
                    <div className="scheduled-reminder-meta">
                      Appointment: {formatDate(r.appointmentDate)} at {r.appointmentTime}
                      <span className="scheduled-send-on">· Send on {formatDate(r.sendOn)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => openScheduledModal(r)}
                    >
                      <MessageCircle size={13} />
                      Send Early
                    </button>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => dismissReminder(r.id)}
                      title="Dismiss"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sent Reminders */}
      {sentReminders.length > 0 && (
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="toolbar-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search sent reminders..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {filteredSent.length > 0 ? (
        <div className="card">
          <div className="section-header" style={{ marginBottom: '4px' }}>
            <h3 className="section-title">Sent Reminders</h3>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Phone</th>
                  <th>Message Preview</th>
                  <th>Sent At</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSent.map(reminder => (
                  <tr key={reminder.id}>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{reminder.patientName}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 13 }}>+91 {reminder.phone.slice(2)}</td>
                    <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {reminder.message ? reminder.message.slice(0, 60) + '...' : '—'}
                    </td>
                    <td>{reminder.sentAt ? formatSentTime(reminder.sentAt) : '—'}</td>
                    <td>
                      <span className="badge-status sent">
                        <span className="badge-dot"></span>
                        Sent
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => {
                          const encodedMessage = encodeURIComponent(reminder.message || '');
                          window.open(`https://wa.me/${reminder.phone}?text=${encodedMessage}`, '_blank');
                        }}
                      >
                        <ExternalLink size={14} />
                        Resend
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : !hasPending ? (
        <div className="card">
          <div className="empty-state">
            <MessageCircle size={48} />
            <h3>No reminders yet</h3>
            <p>Reminders are auto-scheduled when you book appointments, or send one manually from any patient's profile.</p>
          </div>
        </div>
      ) : null}

      {/* Quick Send — pick a patient manually */}
      {!reminderPatient && patients.length > 0 && (
        <div className="card" style={{ marginTop: '24px' }}>
          <h3 className="card-title" style={{ marginBottom: '16px' }}>Quick Send — Select a Patient</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            {patients.slice(0, 8).map(patient => (
              <div
                key={patient.id}
                className="quick-action-card"
                onClick={() => setReminderPatient(patient)}
                style={{ padding: '16px' }}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(145deg, var(--green-700), var(--green-900))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: 13, flexShrink: 0, letterSpacing: '0.5px' }}>
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{patient.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Next: {patient.nextVisit
                      ? new Date(patient.nextVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                      : 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {reminderPatient && (
        <ReminderModal
          patient={reminderPatient}
          onClose={() => setReminderPatient(null)}
        />
      )}

      {activeScheduled && (
        <ReminderModal
          patient={activeScheduled.patient}
          appointmentDate={activeScheduled.appointmentDate}
          scheduledReminderId={activeScheduled.scheduledReminderId}
          defaultTemplate={activeScheduled.defaultTemplate}
          onClose={() => setActiveScheduled(null)}
        />
      )}
    </div>
  );
}
