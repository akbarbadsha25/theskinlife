import { useState, useEffect } from 'react';
import { X, MessageCircle, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { reminderTemplates } from '../data/mockData';

export default function ReminderModal({ patient, appointmentDate, scheduledReminderId, onClose }) {
  const { doctor, sendReminder } = useApp();
  const [selectedTemplate, setSelectedTemplate] = useState('appointment_reminder');
  const [customMessage, setCustomMessage] = useState('');
  const [previewMessage, setPreviewMessage] = useState('');

  useEffect(() => {
    const template = reminderTemplates.find(t => t.id === selectedTemplate);
    if (template && template.text) {
      const dateForMsg = appointmentDate || patient.nextVisit;
      const msg = template.text
        .replace(/{name}/g, patient.name)
        .replace(/{doctor}/g, doctor.name)
        .replace(/{clinic}/g, doctor.clinic)
        .replace(/{treatment}/g, patient.treatment || 'your treatment')
        .replace(/{date}/g, dateForMsg ? formatDate(dateForMsg) : 'TBD');
      setPreviewMessage(msg);
    } else {
      setPreviewMessage(customMessage);
    }
  }, [selectedTemplate, customMessage, patient, doctor, appointmentDate]);

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function handleSend() {
    const message = selectedTemplate === 'custom' ? customMessage : previewMessage;
    if (!message.trim()) return;
    sendReminder(patient, message, selectedTemplate, scheduledReminderId ?? null);
    onClose();
  }

  const displayPhone = patient.phone.replace(/^91/, '+91 ');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageCircle size={20} color="#25D366" />
            Send WhatsApp Reminder
          </h3>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Patient Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: 'var(--bg-card-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(145deg, var(--green-700), var(--green-900))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: 14, flexShrink: 0, letterSpacing: '0.5px' }}>
              {patient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{patient.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{displayPhone}</div>
            </div>
          </div>

          {/* Template Selection */}
          <div className="form-group">
            <label className="form-label">Message Template</label>
            <div className="template-options">
              {reminderTemplates.map(template => (
                <div
                  key={template.id}
                  className={`template-option ${selectedTemplate === template.id ? 'selected' : ''}`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="template-radio" />
                  <span className="template-text">{template.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Message Input */}
          {selectedTemplate === 'custom' && (
            <div className="form-group">
              <label className="form-label">Your Message</label>
              <textarea
                className="form-textarea"
                placeholder="Type your custom reminder message..."
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                rows={4}
              />
            </div>
          )}

          {/* WhatsApp Preview */}
          {previewMessage && (
            <div className="whatsapp-preview">
              <div className="whatsapp-preview-header">
                <MessageCircle size={14} />
                WhatsApp Preview
              </div>
              <div className="whatsapp-bubble">
                {previewMessage}
                <div className="time">
                  {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} ✓✓
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-whatsapp"
            onClick={handleSend}
            disabled={selectedTemplate === 'custom' && !customMessage.trim()}
          >
            <Send size={16} />
            Send via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
