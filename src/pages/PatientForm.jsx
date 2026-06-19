import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cosmetologyTreatments } from '../data/mockData';

function validatePatientId(value, patients, currentId) {
  const trimmed = value.trim();
  if (!trimmed) return 'Patient ID is required.';
  if (!/^[A-Za-z0-9\-]{2,20}$/.test(trimmed))
    return 'Use 2–20 characters: letters, numbers, or hyphens only.';
  const duplicate = patients.find(p =>
    p.patientId &&
    p.patientId.toLowerCase() === trimmed.toLowerCase() &&
    p.id !== currentId
  );
  if (duplicate) return `Patient ID "${trimmed}" is already registered.`;
  return null;
}

function validateForm(form) {
  const errors = {};
  if (!form.patientId.trim()) errors.patientId = 'Patient ID is required.';
  else if (!/^[A-Za-z0-9\-]{2,20}$/.test(form.patientId.trim()))
    errors.patientId = 'Use 2–20 characters: letters, numbers, or hyphens only.';
  if (!form.name.trim()) errors.name = 'Full name is required.';
  const digits = form.phone.replace(/\D/g, '');
  if (!digits) errors.phone = 'Phone number is required.';
  else if (digits.length !== 10) errors.phone = 'Enter a valid 10-digit mobile number.';
  const age = parseInt(form.age);
  if (!form.age) errors.age = 'Age is required.';
  else if (isNaN(age) || age < 1 || age > 120) errors.age = 'Age must be between 1 and 120.';
  return errors;
}

export default function PatientForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addPatient, updatePatient, getPatient, patients, getNextPatientId } = useApp();
  const isEdit = !!id;

  const [form, setForm] = useState({
    patientId: '',
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    bloodGroup: '',
    condition: '',
    treatment: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      const patient = getPatient(id);
      if (patient) {
        setForm({
          patientId: patient.patientId || patient.id || '',
          name: patient.name,
          age: String(patient.age),
          gender: patient.gender,
          phone: patient.phone.replace(/^91/, ''),
          email: patient.email || '',
          address: patient.address || '',
          bloodGroup: patient.bloodGroup || '',
          condition: patient.condition || '',
          treatment: patient.treatment || '',
          notes: patient.notes || '',
        });
      }
    } else {
      setForm(prev => ({ ...prev, patientId: getNextPatientId() }));
    }
  }, [id, isEdit, getPatient, getNextPatientId]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'patientId') {
      const error = validatePatientId(value, patients, id);
      setErrors(prev => ({ ...prev, patientId: error || undefined }));
    } else if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateForm(form);
    const idDupError = !errs.patientId
      ? validatePatientId(form.patientId, patients, id)
      : null;
    if (idDupError) errs.patientId = idDupError;
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const data = {
      ...form,
      patientId: form.patientId.trim(),
      age: parseInt(form.age),
      phone: form.phone.startsWith('91') ? form.phone : `91${form.phone}`,
    };

    if (isEdit) {
      await updatePatient(id, data);
      navigate(`/patients/${id}`);
    } else {
      const newPatient = await addPatient(data);
      if (newPatient) navigate(`/patients/${newPatient.id}`);
    }
  }

  const patientIdIsValid = form.patientId.trim().length > 0 && !errors.patientId;

  return (
    <div>
      <Link to={isEdit ? `/patients/${id}` : '/patients'} className="back-btn">
        <ArrowLeft size={18} /> {isEdit ? 'Back to Patient' : 'Back to Patients'}
      </Link>

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">{isEdit ? 'Edit Patient' : 'Add New Patient'}</h1>
          <p className="page-header-subtitle">{isEdit ? 'Update patient information' : 'Register a new patient in the system'}</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 720 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div className="form-group">
            <label className="form-label">Patient ID *</label>
            <div className="patient-id-input-wrap">
              <input
                className={`form-input ${errors.patientId ? 'input-error' : patientIdIsValid ? 'input-valid' : ''}`}
                name="patientId"
                value={form.patientId}
                onChange={handleChange}
                placeholder="e.g. PT-2026-001"
                maxLength={20}
                autoComplete="off"
              />
              {patientIdIsValid && (
                <CheckCircle size={16} className="patient-id-check" />
              )}
            </div>
            {errors.patientId
              ? <span className="field-error">{errors.patientId}</span>
              : <span className="field-hint">Auto-generated. You can change it if needed.</span>
            }
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Rajesh Kumar"
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                className={`form-input ${errors.phone ? 'input-error' : ''}`}
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                maxLength={10}
              />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Age *</label>
              <input
                className={`form-input ${errors.age ? 'input-error' : ''}`}
                name="age"
                type="number"
                value={form.age}
                onChange={handleChange}
                placeholder="e.g. 35"
                min={1}
                max={120}
              />
              {errors.age && <span className="field-error">{errors.age}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select className="form-select" name="gender" value={form.gender} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. patient@email.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select className="form-select" name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                <option value="">Select</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              className="form-input"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="e.g. 12, MG Road, Bengaluru"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Condition / Concern</label>
              <input
                className="form-input"
                name="condition"
                value={form.condition}
                onChange={handleChange}
                placeholder="e.g. Acne Scarring, Skin Brightening"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Treatment</label>
              <select
                className="form-select"
                name="treatment"
                value={form.treatment}
                onChange={handleChange}
              >
                <option value="">Select Treatment</option>
                {cosmetologyTreatments.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-textarea"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Add any relevant notes..."
              rows={4}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px' }}>
            <Link to={isEdit ? `/patients/${id}` : '/patients'} className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary btn-lg">
              <Save size={18} />
              {isEdit ? 'Save Changes' : 'Add Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
