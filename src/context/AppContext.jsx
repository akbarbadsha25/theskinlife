import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { clinicSettings as defaultClinicSettings, doctorProfile as defaultDoctorProfile } from '../data/mockData';

const AppContext = createContext(null);

// ── DB row → app object mappers ──────────────────────────────────────────────

function toPatient(r) {
  return {
    id: r.id, patientId: r.id,
    name: r.name, age: r.age, gender: r.gender,
    phone: r.phone, email: r.email, address: r.address,
    bloodGroup: r.blood_group, status: r.status,
    condition: r.condition, treatment: r.treatment,
    lastVisit: r.last_visit, nextVisit: r.next_visit,
    notes: r.notes, visits: r.visits || [],
  };
}

function toAppointment(r) {
  return {
    id: r.id, patientId: r.patient_id, patientName: r.patient_name,
    date: r.date, time: r.time, treatment: r.treatment,
    status: r.status, createdAt: r.created_at,
  };
}

function toReminder(r) {
  return {
    id: r.id, patientId: r.patient_id, patientName: r.patient_name,
    phone: r.phone, appointmentId: r.appointment_id,
    appointmentDate: r.appointment_date, appointmentTime: r.appointment_time,
    sendOn: r.send_on, status: r.status, message: r.message,
    template: r.template, sentAt: r.sent_at, createdAt: r.created_at,
  };
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }) {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [clinicConfig, setClinicConfig] = useState(defaultClinicSettings);
  const [doctorData, setDoctorData] = useState(defaultDoctorProfile);
  const [dataLoading, setDataLoading] = useState(true);

  const loadAllData = useCallback(async () => {
    const [
      { data: pData },
      { data: aData },
      { data: rData },
      { data: cData },
      { data: dData },
    ] = await Promise.all([
      supabase.from('patients').select('*').order('created_at', { ascending: false }),
      supabase.from('appointments').select('*').order('date', { ascending: true }),
      supabase.from('reminders').select('*').order('created_at', { ascending: false }),
      supabase.from('clinic_settings').select('*').eq('id', 1).single(),
      supabase.from('doctor_profile').select('*').eq('id', 1).single(),
    ]);

    if (pData) setPatients(pData.map(toPatient));
    if (aData) setAppointments(aData.map(toAppointment));
    if (rData) setReminders(rData.map(toReminder));
    if (cData) setClinicConfig({
      dailyPatientLimit: cData.daily_patient_limit,
      workingDays: cData.working_days,
      reminderDaysBefore: cData.reminder_days_before ?? 2,
      followupDaysAfter: cData.followup_days_after ?? 0,
    });
    if (dData) setDoctorData({
      name: dData.name || defaultDoctorProfile.name,
      specialization: dData.specialization || defaultDoctorProfile.specialization,
      clinic: dData.clinic || defaultDoctorProfile.clinic,
      phone: dData.phone || '',
      email: dData.email || '',
      address: dData.address || '',
    });
    setDataLoading(false);
  }, []);

  useEffect(() => {
    loadAllData();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') loadAllData();
    });
    return () => subscription.unsubscribe();
  }, [loadAllData]);

  // ── Patients ──────────────────────────────────────────────────────────────

  const getNextPatientId = useCallback(() => {
    const numericIds = patients
      .map(p => parseInt(p.id))
      .filter(n => !isNaN(n) && n >= 101);
    return numericIds.length > 0 ? String(Math.max(...numericIds) + 1) : '101';
  }, [patients]);

  const addPatient = useCallback(async (patient) => {
    const numericIds = patients.map(p => parseInt(p.id)).filter(n => !isNaN(n) && n >= 101);
    const nextId = numericIds.length > 0 ? String(Math.max(...numericIds) + 1) : '101';
    const id = (patient.patientId && patient.patientId.trim()) ? patient.patientId.trim() : nextId;
    const row = {
      id,
      name: patient.name,
      age: patient.age ? parseInt(patient.age) : null,
      gender: patient.gender || null,
      phone: patient.phone,
      email: patient.email || null,
      address: patient.address || null,
      blood_group: patient.bloodGroup || null,
      status: 'new',
      condition: patient.condition || null,
      treatment: patient.treatment || null,
      last_visit: patient.lastVisit || null,
      next_visit: patient.nextVisit || null,
      notes: patient.notes || null,
      visits: [],
    };
    const { data, error } = await supabase.from('patients').insert(row).select().single();
    if (!error && data) {
      const newPatient = toPatient(data);
      setPatients(prev => [newPatient, ...prev]);
      showToast('Patient added successfully!', 'success');
      return newPatient;
    }
    if (error?.code === '23505') {
      showToast(`Patient ID ${id} is already taken. Please use a different ID.`, 'error');
    } else {
      showToast('Failed to add patient. Please try again.', 'error');
    }
    return null;
  }, []);

  const updatePatient = useCallback(async (id, data) => {
    const row = {};
    if (data.name !== undefined) row.name = data.name;
    if (data.age !== undefined) row.age = data.age ? parseInt(data.age) : null;
    if (data.gender !== undefined) row.gender = data.gender;
    if (data.phone !== undefined) row.phone = data.phone;
    if (data.email !== undefined) row.email = data.email;
    if (data.address !== undefined) row.address = data.address;
    if (data.bloodGroup !== undefined) row.blood_group = data.bloodGroup;
    if (data.status !== undefined) row.status = data.status;
    if (data.condition !== undefined) row.condition = data.condition;
    if (data.treatment !== undefined) row.treatment = data.treatment;
    if (data.lastVisit !== undefined) row.last_visit = data.lastVisit || null;
    if (data.nextVisit !== undefined) row.next_visit = data.nextVisit || null;
    if (data.notes !== undefined) row.notes = data.notes;
    if (data.visits !== undefined) row.visits = data.visits;

    const { error } = await supabase.from('patients').update(row).eq('id', id);
    if (!error) {
      setPatients(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
      showToast('Patient updated successfully!', 'success');
    } else {
      showToast('Failed to update patient.', 'error');
    }
  }, []);

  const deletePatient = useCallback(async (id) => {
    const { error } = await supabase.from('patients').delete().eq('id', id);
    if (!error) {
      setPatients(prev => prev.filter(p => p.id !== id));
      showToast('Patient removed.', 'success');
    } else {
      showToast('Failed to remove patient.', 'error');
    }
  }, []);

  // ── Reminders ─────────────────────────────────────────────────────────────

  const sendReminder = useCallback(async (patient, message, template, scheduledReminderId = null) => {
    if (scheduledReminderId) {
      const { error } = await supabase.from('reminders')
        .update({ message, template, sent_at: new Date().toISOString(), status: 'sent' })
        .eq('id', scheduledReminderId);
      if (!error) {
        setReminders(prev => prev.map(r =>
          r.id === scheduledReminderId
            ? { ...r, message, template, sentAt: new Date().toISOString(), status: 'sent' }
            : r
        ));
      }
    } else {
      const row = {
        id: `R${Date.now()}`,
        patient_id: patient.id,
        patient_name: patient.name,
        phone: patient.phone,
        message,
        template,
        sent_at: new Date().toISOString(),
        status: 'sent',
      };
      const { data, error } = await supabase.from('reminders').insert(row).select().single();
      if (!error && data) {
        setReminders(prev => [toReminder(data), ...prev]);
      }
    }
    window.open(`https://wa.me/${patient.phone}?text=${encodeURIComponent(message)}`, '_blank');
    showToast(`Reminder sent to ${patient.name} via WhatsApp!`, 'success');
  }, []);

  const dismissReminder = useCallback(async (id) => {
    const { error } = await supabase.from('reminders').update({ status: 'dismissed' }).eq('id', id);
    if (!error) {
      setReminders(prev => prev.map(r => r.id === id ? { ...r, status: 'dismissed' } : r));
    }
  }, []);

  // ── Appointments ──────────────────────────────────────────────────────────

  const getAppointmentsForDate = useCallback((date) => {
    return appointments.filter(a => a.date === date && a.status !== 'cancelled');
  }, [appointments]);

  const getBookingCountForDate = useCallback((date) => {
    return appointments.filter(a => a.date === date && a.status !== 'cancelled').length;
  }, [appointments]);

  const isDateFull = useCallback((date) => {
    return getBookingCountForDate(date) >= clinicConfig.dailyPatientLimit;
  }, [getBookingCountForDate, clinicConfig.dailyPatientLimit]);

  const isSlotBooked = useCallback((date, time) => {
    return appointments.some(a => a.date === date && a.time === time && a.status !== 'cancelled');
  }, [appointments]);

  const bookAppointment = useCallback(async (appointmentData) => {
    const { date, time, patientId, patientName, treatment } = appointmentData;

    if (isDateFull(date)) {
      showToast(`Daily limit of ${clinicConfig.dailyPatientLimit} patients reached. Please choose another date.`, 'error');
      return null;
    }
    if (isSlotBooked(date, time)) {
      showToast('This time slot is already booked. Please choose another.', 'error');
      return null;
    }

    const apptId = `A${Date.now()}`;
    const apptRow = {
      id: apptId,
      patient_id: patientId,
      patient_name: patientName,
      date,
      time,
      treatment: treatment || '',
      status: 'confirmed',
    };

    const { data: apptData, error: apptError } = await supabase
      .from('appointments').insert(apptRow).select().single();

    if (apptError) {
      showToast('Failed to book appointment.', 'error');
      return null;
    }

    const newAppointment = toAppointment(apptData);
    setAppointments(prev => [...prev, newAppointment]);

    // Auto-schedule reminder N days before (configurable)
    const patient = patients.find(p => p.id === patientId);
    const sendOnDate = new Date(date + 'T00:00:00');
    sendOnDate.setDate(sendOnDate.getDate() - (clinicConfig.reminderDaysBefore ?? 2));

    const reminderRow = {
      id: `SR${Date.now()}`,
      patient_id: patientId,
      patient_name: patientName,
      phone: patient?.phone || '',
      appointment_id: apptId,
      appointment_date: date,
      appointment_time: time,
      send_on: sendOnDate.toISOString().split('T')[0],
      status: 'pending',
      template: 'appointment_reminder',
    };

    const { data: remData } = await supabase.from('reminders').insert(reminderRow).select().single();
    if (remData) setReminders(prev => [...prev, toReminder(remData)]);

    // Auto-schedule post-visit follow-up N days after (configurable)
    const followUpDate = new Date(date + 'T00:00:00');
    followUpDate.setDate(followUpDate.getDate() + (clinicConfig.followupDaysAfter ?? 0));
    const followUpRow = {
      id: `FU${Date.now()}`,
      patient_id: patientId,
      patient_name: patientName,
      phone: patient?.phone || '',
      appointment_id: apptId,
      appointment_date: date,
      appointment_time: time,
      send_on: followUpDate.toISOString().split('T')[0],
      status: 'pending',
      template: 'post_visit_followup',
    };
    const { data: fuData } = await supabase.from('reminders').insert(followUpRow).select().single();
    if (fuData) setReminders(prev => [...prev, toReminder(fuData)]);

    showToast(
      `Appointment booked for ${patientName} on ${new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at ${time}`,
      'success'
    );
    return newAppointment;
  }, [isDateFull, isSlotBooked, clinicConfig.dailyPatientLimit, patients]);

  const cancelAppointment = useCallback(async (appointmentId) => {
    const { error } = await supabase.from('appointments')
      .update({ status: 'cancelled' }).eq('id', appointmentId);
    if (!error) {
      setAppointments(prev => prev.map(a =>
        a.id === appointmentId ? { ...a, status: 'cancelled' } : a
      ));
      showToast('Appointment cancelled.', 'success');
    }
  }, []);

  // ── Settings ──────────────────────────────────────────────────────────────

  const updateClinicConfig = useCallback(async (newConfig) => {
    const row = {};
    if (newConfig.dailyPatientLimit !== undefined) row.daily_patient_limit = newConfig.dailyPatientLimit;
    if (newConfig.workingDays !== undefined) row.working_days = newConfig.workingDays;
    if (newConfig.reminderDaysBefore !== undefined) row.reminder_days_before = newConfig.reminderDaysBefore;
    if (newConfig.followupDaysAfter !== undefined) row.followup_days_after = newConfig.followupDaysAfter;
    const { error } = await supabase.from('clinic_settings').update(row).eq('id', 1);
    if (!error) setClinicConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const updateDoctor = useCallback(async (newData) => {
    const { error } = await supabase.from('doctor_profile').update({
      name: newData.name,
      specialization: newData.specialization,
      clinic: newData.clinic,
      phone: newData.phone,
      email: newData.email,
      address: newData.address,
    }).eq('id', 1);
    if (!error) setDoctorData(prev => ({ ...prev, ...newData }));
  }, []);

  // ── Toasts ────────────────────────────────────────────────────────────────

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // ── Stats ─────────────────────────────────────────────────────────────────

  const getPatient = useCallback((id) => patients.find(p => p.id === id), [patients]);

  const getStats = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);
    const in7DaysStr = in7Days.toISOString().split('T')[0];

    return {
      totalPatients: patients.length,
      activePatients: patients.filter(p => p.status === 'active').length,
      newPatients: patients.filter(p => p.status === 'new').length,
      todayReminders: reminders.filter(r => r.sentAt && r.sentAt.split('T')[0] === today).length,
      pendingFollowups: appointments.filter(a =>
        a.status !== 'cancelled' && a.date >= today && a.date <= in7DaysStr
      ).length,
      totalReminders: reminders.filter(r => r.status === 'sent').length,
      dueRemindersCount: reminders.filter(r => r.status === 'pending' && r.sendOn <= today).length,
      todayAppointmentCount: getBookingCountForDate(today),
      dailyLimit: clinicConfig.dailyPatientLimit,
    };
  }, [patients, reminders, appointments, getBookingCountForDate, clinicConfig.dailyPatientLimit]);

  if (dataLoading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-main)', color: 'var(--text-secondary)', fontSize: 15,
      }}>
        Loading clinic data…
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      patients, reminders, toasts, appointments, clinicConfig,
      doctor: doctorData, updateDoctor,
      addPatient, updatePatient, deletePatient, getNextPatientId,
      sendReminder, dismissReminder, showToast,
      getPatient, getStats,
      getAppointmentsForDate, getBookingCountForDate,
      isDateFull, isSlotBooked, bookAppointment, cancelAppointment,
      updateClinicConfig,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
