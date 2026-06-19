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
    id: 'appointment_reminder',
    label: '📅 Appointment Reminder',
    text: 'Hello {name}! 👋\n\nThis is a reminder from *{clinic}*.\n\nYour *{treatment}* appointment is confirmed for *{date}*.\n\nPlease arrive 10 minutes early. If you need to reschedule, kindly let us know in advance.\n\nSee you soon! ✨',
  },
  {
    id: 'post_visit_followup',
    label: '💚 Post-Visit Follow-up',
    text: 'Hello {name}! 😊\n\nThank you for visiting *{clinic}* today!\n\nWe hope your *{treatment}* session went well. Please follow the aftercare instructions shared by our team.\n\n💧 Stay hydrated and avoid direct sun exposure for 48 hours.\n\nFeel free to reach out if you have any questions. Take care! 🌟',
  },
  {
    id: 'care_instructions',
    label: '🌿 Care Instructions',
    text: 'Hello {name}! 🌸\n\nPost-treatment care reminder from *{clinic}*:\n\n✅ Avoid direct sunlight for 48 hours\n✅ Apply sunscreen SPF 30+ every day\n✅ Keep your skin well hydrated\n✅ Avoid makeup for 24 hours\n✅ Do not scrub or exfoliate for 3 days\n✅ Drink plenty of water\n\nFor any concerns, please contact us anytime. Take care! 💚',
  },
  {
    id: 'next_appointment',
    label: '📆 Next Appointment Due',
    text: 'Hello {name}! 👋\n\nIt\'s been a while since your last visit at *{clinic}*. 💆‍♀️\n\nFor the best results with your *{treatment}*, we recommend scheduling your next session soon.\n\nPlease call us or reply here to book your appointment. We look forward to seeing you! 🌟',
  },
  {
    id: 'review_request',
    label: '⭐ Review Request',
    text: 'Hello {name}! 😊\n\nWe hope you are loving the results of your *{treatment}* at *{clinic}*! ✨\n\nYour feedback means the world to us and helps us serve you better.\n\nWould you kindly take a moment to share your experience? We truly appreciate it! 💛\n\nThank you for trusting us with your skin care! 🌸',
  },
  {
    id: 'custom',
    label: '✏️ Custom Message',
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
