import { useState, useMemo, useRef, useEffect } from 'react';
import { CalendarDays, Clock, Users, AlertTriangle, ChevronLeft, ChevronRight, X, Sparkles, Check, Search, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { timeSlots } from '../data/mockData';
import { getAvatarColor, getInitials } from '../data/mockData';

export default function Appointments() {
  const {
    patients, clinicConfig, appointments,
    getAppointmentsForDate, getBookingCountForDate, isDateFull,
    isSlotBooked, bookAppointment, cancelAppointment,
  } = useApp();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingForm, setBookingForm] = useState({ patientId: '', treatment: '' });
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [activeTab, setActiveTab] = useState('calendar');

  // Patient combobox state
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const comboboxRef = useRef(null);
  const searchInputRef = useRef(null);

  // Calendar helpers
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const monthName = currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, date: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = new Date(year, month, d).getDay();
      const isWorkingDay = clinicConfig.workingDays.includes(dayOfWeek);
      const count = getBookingCountForDate(dateStr);
      const isFull = count >= clinicConfig.dailyPatientLimit;
      const isPast = new Date(dateStr) < new Date(new Date().toISOString().split('T')[0]);
      days.push({
        day: d, date: dateStr, count, isFull, isWorkingDay, isPast,
        isToday: dateStr === new Date().toISOString().split('T')[0],
        isSelected: dateStr === selectedDate,
      });
    }
    return days;
  }, [year, month, daysInMonth, firstDayOfWeek, selectedDate, getBookingCountForDate, clinicConfig]);

  const todayDate = new Date().toISOString().split('T')[0];
  const dayAppointments = getAppointmentsForDate(selectedDate);
  const dayCount = getBookingCountForDate(selectedDate);
  const dayIsFull = isDateFull(selectedDate);
  const remaining = clinicConfig.dailyPatientLimit - dayCount;
  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const isPastDate = selectedDateObj < new Date(todayDate);
  const selectedDayOfWeek = selectedDateObj.getDay();
  const isWorkingDay = clinicConfig.workingDays.includes(selectedDayOfWeek);

  // Filtered patients for combobox
  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients;
    const q = patientSearch.toLowerCase();
    return patients.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.condition && p.condition.toLowerCase().includes(q)) ||
      (p.treatment && p.treatment.toLowerCase().includes(q))
    );
  }, [patients, patientSearch]);

  const selectedPatient = useMemo(
    () => patients.find(p => p.id === bookingForm.patientId) || null,
    [patients, bookingForm.patientId]
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target)) {
        setShowPatientDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (showPatientDropdown && !bookingForm.patientId) {
      setTimeout(() => searchInputRef.current?.focus(), 30);
    }
  }, [showPatientDropdown]);

  function selectPatient(patient) {
    setBookingForm(prev => ({
      ...prev,
      patientId: patient.id,
      treatment: patient.treatment || '',
    }));
    setPatientSearch('');
    setShowPatientDropdown(false);
  }

  function clearPatient() {
    setBookingForm(prev => ({ ...prev, patientId: '', treatment: '' }));
    setPatientSearch('');
    setHighlightedIndex(0);
    setTimeout(() => {
      setShowPatientDropdown(true);
      searchInputRef.current?.focus();
    }, 30);
  }

  function handleComboKeyDown(e) {
    if (!showPatientDropdown) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') setShowPatientDropdown(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, filteredPatients.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredPatients[highlightedIndex]) selectPatient(filteredPatients[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setShowPatientDropdown(false);
    }
  }

  function prevMonth() { setCurrentMonth(new Date(year, month - 1, 1)); }
  function nextMonth() { setCurrentMonth(new Date(year, month + 1, 1)); }

  function handleDateSelect(dateStr) {
    setSelectedDate(dateStr);
    setActiveTab('slots');
  }

  function handleSlotClick(slot) {
    if (isPastDate || !isWorkingDay) return;
    if (isSlotBooked(selectedDate, slot)) return;
    if (dayIsFull) return;
    setSelectedSlot(slot);
    setBookingForm({ patientId: '', treatment: '' });
    setPatientSearch('');
    setHighlightedIndex(0);
    setShowPatientDropdown(false);
    setShowBookingModal(true);
  }

  function handleBook() {
    if (!bookingForm.patientId) return;
    const patient = patients.find(p => p.id === bookingForm.patientId);
    if (!patient) return;
    bookAppointment({
      date: selectedDate,
      time: selectedSlot,
      patientId: patient.id,
      patientName: patient.name,
      treatment: bookingForm.treatment || patient.treatment || '',
    });
    setShowBookingModal(false);
  }

  const formatSelectedDate = selectedDateObj.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const nextAvailableDate = useMemo(() => {
    if (!dayIsFull) return null;
    for (let i = 1; i <= 60; i++) {
      const d = new Date(selectedDateObj);
      d.setDate(d.getDate() + i);
      const ds = d.toISOString().split('T')[0];
      const dow = d.getDay();
      if (!clinicConfig.workingDays.includes(dow)) continue;
      if (getBookingCountForDate(ds) < clinicConfig.dailyPatientLimit) return ds;
    }
    return null;
  }, [dayIsFull, selectedDate, clinicConfig, getBookingCountForDate]);

  // Highlight matched text in search results
  function highlight(text, query) {
    if (!query.trim()) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="combo-highlight">{text.slice(idx, idx + query.length)}</mark>
        {text.slice(idx + query.length)}
      </>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Appointments</h1>
          <p className="page-header-subtitle">Manage your appointment calendar</p>
        </div>
        <div className="page-header-actions">
          <div className="daily-limit-badge">
            <Users size={16} />
            <span>Daily Limit: <strong>{clinicConfig.dailyPatientLimit}</strong></span>
          </div>
        </div>
      </div>

      {/* Mobile tab bar — hidden on desktop via CSS */}
      <div className="appt-mobile-tabs">
        <button
          className={`appt-tab-btn${activeTab === 'calendar' ? ' active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          <CalendarDays size={15} />
          Calendar
        </button>
        <button
          className={`appt-tab-btn${activeTab === 'slots' ? ' active' : ''}`}
          onClick={() => setActiveTab('slots')}
        >
          <Clock size={15} />
          Schedule
          {dayAppointments.length > 0 && (
            <span className="appt-tab-count">{dayAppointments.length}</span>
          )}
        </button>
      </div>

      <div className={`appointments-layout appt-layout--${activeTab}`}>
        {/* Calendar Panel */}
        <div className="card calendar-panel">
          <div className="calendar-header">
            <button className="cal-nav-btn" onClick={prevMonth}><ChevronLeft size={18} /></button>
            <h3 className="cal-month-title">{monthName}</h3>
            <button className="cal-nav-btn" onClick={nextMonth}><ChevronRight size={18} /></button>
          </div>
          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="cal-day-label">{d}</div>
            ))}
            {calendarDays.map((d, i) => (
              <button
                key={i}
                className={`cal-day ${d.isSelected ? 'selected' : ''} ${d.isToday ? 'today' : ''} ${d.isFull ? 'full' : ''} ${!d.isWorkingDay ? 'off-day' : ''} ${d.isPast ? 'past' : ''}`}
                disabled={!d.day || !d.isWorkingDay || d.isPast}
                onClick={() => d.day && d.isWorkingDay && !d.isPast && handleDateSelect(d.date)}
              >
                {d.day && (
                  <>
                    <span className="cal-day-num">{d.day}</span>
                    {d.count > 0 && d.isWorkingDay && (
                      <span className={`cal-day-count ${d.isFull ? 'full' : ''}`}>{d.count}</span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>
          <div className="calendar-legend">
            <div className="legend-item"><span className="legend-dot available"></span> Available</div>
            <div className="legend-item"><span className="legend-dot partial"></span> Partially booked</div>
            <div className="legend-item"><span className="legend-dot full"></span> Full</div>
            <div className="legend-item"><span className="legend-dot off"></span> Off day</div>
          </div>
        </div>

        {/* Day Detail Panel */}
        <div className="day-detail-panel">
          <div className="card day-header-card">
            <div className="day-header-info">
              <CalendarDays size={20} />
              <div>
                <h3>{formatSelectedDate}</h3>
                {!isWorkingDay && <span className="off-day-label">Clinic Closed</span>}
              </div>
            </div>
            <div className="day-stats">
              <div className={`capacity-badge ${dayIsFull ? 'full' : remaining <= 3 ? 'warning' : 'available'}`}>
                <Users size={14} />
                <span>{dayCount} / {clinicConfig.dailyPatientLimit}</span>
              </div>
              {isWorkingDay && !isPastDate && (
                <span className={`slots-remaining ${dayIsFull ? 'zero' : ''}`}>
                  {dayIsFull ? 'No slots remaining' : `${remaining} slot${remaining !== 1 ? 's' : ''} remaining`}
                </span>
              )}
            </div>
          </div>

          {dayIsFull && isWorkingDay && !isPastDate && (
            <div className="full-day-alert">
              <AlertTriangle size={20} />
              <div className="full-day-alert-content">
                <strong>Daily patient limit reached!</strong>
                <p>All {clinicConfig.dailyPatientLimit} slots are booked for this day.
                  {nextAvailableDate && (
                    <> Next available date: <button className="link-btn" onClick={() => {
                      setSelectedDate(nextAvailableDate);
                      const nd = new Date(nextAvailableDate);
                      setCurrentMonth(new Date(nd.getFullYear(), nd.getMonth(), 1));
                    }}>
                      {new Date(nextAvailableDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </button></>
                  )}
                </p>
              </div>
            </div>
          )}

          {isWorkingDay && (
            <div className="card">
              <h4 className="section-title"><Clock size={16} /> Time Slots</h4>
              <div className="time-slots-grid">
                {timeSlots.map(slot => {
                  const booked = isSlotBooked(selectedDate, slot);
                  const appointment = booked ? dayAppointments.find(a => a.time === slot) : null;
                  const disabled = isPastDate || dayIsFull;
                  return (
                    <div
                      key={slot}
                      className={`time-slot ${booked ? 'booked' : ''} ${disabled && !booked ? 'disabled' : ''}`}
                      onClick={() => !booked && !disabled && handleSlotClick(slot)}
                    >
                      <div className="slot-time">{slot}</div>
                      {booked && appointment ? (
                        <div className="slot-patient">
                          <div className="slot-patient-avatar" style={{ background: getAvatarColor(parseInt(appointment.patientId.replace('P', '')) - 1) }}>
                            {getInitials(appointment.patientName)}
                          </div>
                          <div className="slot-patient-info">
                            <span className="slot-patient-name">{appointment.patientName}</span>
                            <span className="slot-treatment">{appointment.treatment}</span>
                          </div>
                          {!isPastDate && (
                            <button
                              className="slot-cancel-btn"
                              onClick={e => { e.stopPropagation(); setConfirmCancelId(appointment.id); }}
                              title="Cancel appointment"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="slot-empty">
                          {disabled ? (
                            <span className="slot-unavailable">{isPastDate ? 'Past' : 'Full'}</span>
                          ) : (
                            <span className="slot-available">+ Book</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {dayAppointments.length > 0 && (
            <div className="card">
              <h4 className="section-title"><Check size={16} /> Booked Appointments ({dayAppointments.length})</h4>
              <div className="booked-list">
                {dayAppointments
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((apt, idx) => (
                  <div key={apt.id} className="booked-item">
                    <div className="booked-index">{idx + 1}</div>
                    <div className="booked-time">{apt.time}</div>
                    <div className="booked-patient-avatar" style={{ background: getAvatarColor(parseInt(apt.patientId.replace('P', '')) - 1) }}>
                      {getInitials(apt.patientName)}
                    </div>
                    <div className="booked-info">
                      <span className="booked-name">{apt.patientName}</span>
                      <span className="booked-treatment"><Sparkles size={10} /> {apt.treatment}</span>
                    </div>
                    <span className={`badge-status ${apt.status}`}>
                      <span className="badge-dot"></span>
                      {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="modal-overlay" onClick={() => { setShowBookingModal(false); setBookingForm({ patientId: '', treatment: '' }); setPatientSearch(''); }}>
          <div className="modal-content booking-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Book Appointment</h3>
              <button className="modal-close" onClick={() => { setShowBookingModal(false); setBookingForm({ patientId: '', treatment: '' }); setPatientSearch(''); }}>
                <X size={18} />
              </button>
            </div>

            <div className="booking-meta">
              <div className="booking-meta-item">
                <CalendarDays size={14} />
                {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div className="booking-meta-item">
                <Clock size={14} />
                {selectedSlot}
              </div>
            </div>

            <div className="booking-form">
              {/* ── Searchable Patient Combobox ── */}
              <div className="form-group">
                <label className="form-label">Patient *</label>
                <div className="patient-combobox" ref={comboboxRef}>

                  {/* Trigger / Input row */}
                  <div
                    className={`patient-combo-trigger ${showPatientDropdown && !selectedPatient ? 'open' : ''} ${selectedPatient ? 'selected' : ''}`}
                    onClick={() => {
                      if (!selectedPatient) {
                        setShowPatientDropdown(v => !v);
                      }
                    }}
                  >
                    {selectedPatient ? (
                      /* Selected patient display */
                      <>
                        <div
                          className="patient-combo-avatar"
                          style={{ background: getAvatarColor(parseInt(selectedPatient.id.replace('P', '')) - 1) }}
                        >
                          {getInitials(selectedPatient.name)}
                        </div>
                        <div className="patient-combo-selected-info">
                          <span className="patient-combo-selected-name">{selectedPatient.name}</span>
                          <span className="patient-combo-selected-sub">{selectedPatient.id}</span>
                        </div>
                        <button
                          className="patient-combo-clear"
                          type="button"
                          onClick={e => { e.stopPropagation(); clearPatient(); }}
                          title="Change patient"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      /* Search input */
                      <>
                        <Search size={15} className="patient-combo-search-icon" />
                        <input
                          ref={searchInputRef}
                          className="patient-combo-search"
                          placeholder="Type name, ID or condition…"
                          value={patientSearch}
                          onChange={e => {
                            setPatientSearch(e.target.value);
                            setHighlightedIndex(0);
                            setShowPatientDropdown(true);
                          }}
                          onFocus={() => setShowPatientDropdown(true)}
                          onKeyDown={handleComboKeyDown}
                          autoComplete="off"
                        />
                        <ChevronDown
                          size={15}
                          className={`patient-combo-chevron ${showPatientDropdown ? 'rotated' : ''}`}
                        />
                      </>
                    )}
                  </div>

                  {/* Dropdown list */}
                  {showPatientDropdown && !selectedPatient && (
                    <div className="patient-combo-dropdown">
                      {filteredPatients.length === 0 ? (
                        <div className="patient-combo-empty">
                          <Search size={16} />
                          No patients found for "{patientSearch}"
                        </div>
                      ) : (
                        <>
                          {patientSearch && (
                            <div className="patient-combo-count">
                              {filteredPatients.length} result{filteredPatients.length !== 1 ? 's' : ''}
                            </div>
                          )}
                          {filteredPatients.map((p, idx) => (
                            <div
                              key={p.id}
                              className={`patient-combo-item ${idx === highlightedIndex ? 'highlighted' : ''}`}
                              onMouseDown={() => selectPatient(p)}
                              onMouseEnter={() => setHighlightedIndex(idx)}
                            >
                              <div
                                className="patient-combo-item-avatar"
                                style={{ background: getAvatarColor(parseInt(p.id.replace('P', '')) - 1) }}
                              >
                                {getInitials(p.name)}
                              </div>
                              <div className="patient-combo-item-info">
                                <span className="patient-combo-item-name">
                                  {highlight(p.name, patientSearch)}
                                </span>
                                <span className="patient-combo-item-sub">
                                  {highlight(p.id, patientSearch)}
                                  {p.treatment && <> · {p.treatment}</>}
                                </span>
                              </div>
                              {idx === highlightedIndex && (
                                <Check size={14} className="patient-combo-item-check" />
                              )}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Treatment */}
              <div className="form-group">
                <label className="form-label">Treatment</label>
                <input
                  className="form-input"
                  value={bookingForm.treatment}
                  onChange={e => setBookingForm(prev => ({ ...prev, treatment: e.target.value }))}
                  placeholder="Auto-filled from patient record"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => { setShowBookingModal(false); setBookingForm({ patientId: '', treatment: '' }); setPatientSearch(''); }}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleBook}
                disabled={!bookingForm.patientId}
              >
                <CalendarDays size={16} />
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {confirmCancelId && (() => {
        const apt = appointments.find(a => a.id === confirmCancelId);
        if (!apt) return null;
        return (
          <div className="modal-overlay" onClick={() => setConfirmCancelId(null)}>
            <div className="modal-content" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Cancel Appointment?</h3>
                <button className="modal-close" onClick={() => setConfirmCancelId(null)}><X size={18} /></button>
              </div>
              <div style={{ padding: '16px 24px 8px', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Cancel the appointment for <strong>{apt.patientName}</strong> on{' '}
                <strong>{new Date(apt.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</strong> at <strong>{apt.time}</strong>?
                <br /><br />
                This slot will become available for booking again.
              </div>
              <div className="modal-actions">
                <button className="btn btn-outline" onClick={() => setConfirmCancelId(null)}>Keep It</button>
                <button
                  className="btn btn-danger"
                  onClick={() => { cancelAppointment(confirmCancelId); setConfirmCancelId(null); }}
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
