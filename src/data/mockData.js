// ── Static helpers (used across the app) ─────────────────────────────────────

const avatarColors = [
  'linear-gradient(145deg, #1A3C34, #2A6355)',
  'linear-gradient(145deg, #2E86C1, #1A5276)',
  'linear-gradient(145deg, #7D3C98, #5B2C6F)',
  'linear-gradient(145deg, #C08B4C, #8B6914)',
  'linear-gradient(145deg, #C0392B, #922B21)',
  'linear-gradient(145deg, #148F77, #0E6655)',
  'linear-gradient(145deg, #AF7AC5, #7D3C98)',
  'linear-gradient(145deg, #27AE60, #1E8449)',
];

export function getAvatarColor(index) {
  return avatarColors[index % avatarColors.length];
}

export function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export const cosmetologyTreatments = [
  'Glutathione IV Therapy',
  'Face Lift (Surgical)',
  'Non-Surgical Face Lift',
  'Botox / Botulinum Toxin',
  'Dermal Fillers',
  'PRP Therapy (Vampire Facial)',
  'Chemical Peel',
  'Microdermabrasion',
  'Laser Hair Removal',
  'Laser Skin Resurfacing',
  'Hydrafacial',
  'Mesotherapy',
  'Thread Lift',
  'Carbon Laser Peel',
  'Microneedling / Derma Roller',
  'Hair Transplant (FUE)',
  'Hair Transplant (FUT)',
  'Lip Augmentation',
  'Rhinoplasty (Nose Job)',
  'Blepharoplasty (Eyelid Surgery)',
  'Liposuction',
  'Tummy Tuck (Abdominoplasty)',
  'Scar Revision',
  'Skin Tag / Mole Removal',
  'Tattoo Removal (Laser)',
  'Acne Treatment',
  'Anti-Aging Treatment',
  'Body Contouring',
  'Vampire Hair Treatment (PRP)',
  'Skin Whitening Treatment',
  'Dark Circle Treatment',
  'Pigmentation Treatment',
  'Other',
];

export const reminderTemplates = [
  {
    id: 'followup',
    label: 'Follow-up Reminder',
    text: 'Hello {name}, this is a reminder from Dr. {doctor} at {clinic}. Your follow-up visit is scheduled for {date}. Please confirm your appointment. Thank you! 🏥',
  },
  {
    id: 'checkup',
    label: 'Regular Check-up',
    text: 'Hi {name}, it\'s time for your regular health check-up with Dr. {doctor}. We have you scheduled for {date}. Please visit us at {clinic}. Stay healthy! 💊',
  },
  {
    id: 'report',
    label: 'Report Collection',
    text: 'Dear {name}, your test reports are ready for collection at {clinic}. Please visit us during clinic hours. For queries, contact Dr. {doctor}. 📋',
  },
  {
    id: 'custom',
    label: 'Custom Message',
    text: '',
  },
];

export const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM',
];

// Default fallbacks — overridden by values saved in Supabase
export const clinicSettings = {
  dailyPatientLimit: 10,
  workingDays: [1, 2, 3, 4, 5, 6],
};

export const doctorProfile = {
  name: 'Doctor Name',
  specialization: 'Cosmetology & Aesthetic Medicine',
  clinic: 'The Skin Life',
  phone: '',
  email: '',
  address: '',
};
