import { useState } from 'react';
import { Save, Users, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const { doctor, clinicConfig, updateClinicConfig, updateDoctor, showToast } = useApp();
  const [form, setForm] = useState({
    name: doctor.name,
    specialization: doctor.specialization,
    clinic: doctor.clinic,
    phone: doctor.phone.replace(/^91/, ''),
    email: doctor.email,
    address: doctor.address,
    dailyPatientLimit: String(clinicConfig.dailyPatientLimit),
    workingDays: clinicConfig.workingDays,
    reminderDaysBefore: String(clinicConfig.reminderDaysBefore ?? 2),
    followupDaysAfter: String(clinicConfig.followupDaysAfter ?? 0),
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function toggleWorkingDay(day) {
    setForm(prev => {
      const days = prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day].sort();
      return { ...prev, workingDays: days };
    });
  }

  function handleSave(e) {
    e.preventDefault();
    const limit = parseInt(form.dailyPatientLimit, 10);
    if (isNaN(limit) || limit < 1 || limit > 50) {
      showToast('Daily limit must be between 1 and 50', 'error');
      return;
    }
    updateDoctor({
      name: form.name,
      specialization: form.specialization,
      clinic: form.clinic,
      phone: form.phone.startsWith('91') ? form.phone : `91${form.phone}`,
      email: form.email,
      address: form.address,
    });
    updateClinicConfig({
      dailyPatientLimit: limit,
      workingDays: form.workingDays,
      reminderDaysBefore: parseInt(form.reminderDaysBefore, 10),
      followupDaysAfter: parseInt(form.followupDaysAfter, 10),
    });
    showToast('Settings saved successfully!', 'success');
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Settings</h1>
          <p className="page-header-subtitle">Manage your profile, schedule, and preferences</p>
        </div>
      </div>

      <div style={{ maxWidth: 720 }}>
        <form onSubmit={handleSave}>
          {/* Doctor Profile */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="settings-section">
              <h3>Doctor Profile</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" name="name" value={form.name} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Specialization</label>
                    <input className="form-input" name="specialization" value={form.specialization} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" name="phone" value={form.phone} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Clinic Info */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="settings-section">
              <h3>Clinic Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Clinic Name</label>
                  <input className="form-input" name="clinic" value={form.clinic} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input className="form-input" name="address" value={form.address} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Settings */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="settings-section">
              <h3><Users size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />Appointment Settings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Daily Patient Limit</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      className="form-input"
                      name="dailyPatientLimit"
                      type="number"
                      min="1"
                      max="50"
                      value={form.dailyPatientLimit}
                      onChange={handleChange}
                      style={{ maxWidth: 120 }}
                    />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      patients per day (1–50)
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
                    When this limit is reached, new bookings will be blocked and patients will be redirected to the next available date.
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label"><Clock size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />Working Days</label>
                  <div className="working-days-grid">
                    {dayLabels.map((label, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`working-day-btn ${form.workingDays.includes(idx) ? 'active' : ''}`}
                        onClick={() => toggleWorkingDay(idx)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
                    Click to toggle working days. Disabled days won't appear available in the calendar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reminder Settings */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="settings-section">
              <h3><Clock size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />WhatsApp Reminder Timing</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Appointment Reminder — Days Before Visit</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <select className="form-select" name="reminderDaysBefore" value={form.reminderDaysBefore} onChange={handleChange} style={{ maxWidth: 200 }}>
                      <option value="1">1 day before</option>
                      <option value="2">2 days before</option>
                      <option value="3">3 days before</option>
                      <option value="5">5 days before</option>
                      <option value="7">1 week before</option>
                    </select>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
                    When an appointment is booked, a WhatsApp reminder will be auto-scheduled this many days before the visit.
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Post-Visit Follow-up — Days After Visit</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <select className="form-select" name="followupDaysAfter" value={form.followupDaysAfter} onChange={handleChange} style={{ maxWidth: 200 }}>
                      <option value="0">Same day as visit</option>
                      <option value="1">1 day after</option>
                      <option value="2">2 days after</option>
                      <option value="3">3 days after</option>
                    </select>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
                    After each visit, a follow-up reminder will appear for the receptionist to send a care message to the patient.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary btn-lg">
              <Save size={18} />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
