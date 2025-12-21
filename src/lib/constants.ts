export const APP_NAME = 'Patient Management System'
export const APP_DESCRIPTION = 'Comprehensive healthcare platform for patients and doctors'

export const ROLES = {
    PATIENT: 'PATIENT',
    DOCTOR: 'DOCTOR',
    ADMIN: 'ADMIN',
} as const

export const APPOINTMENT_STATUS = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    RESCHEDULED: 'RESCHEDULED',
} as const

export const MESSAGE_TYPE = {
    REGULAR: 'REGULAR',
    EMERGENCY: 'EMERGENCY',
} as const

export const NOTIFICATION_TYPE = {
    APPOINTMENT_REMINDER: 'APPOINTMENT_REMINDER',
    APPOINTMENT_CONFIRMED: 'APPOINTMENT_CONFIRMED',
    APPOINTMENT_CANCELLED: 'APPOINTMENT_CANCELLED',
    EMERGENCY_CHAT: 'EMERGENCY_CHAT',
    NEW_MESSAGE: 'NEW_MESSAGE',
    PRESCRIPTION_READY: 'PRESCRIPTION_READY',
    LAB_REPORT_READY: 'LAB_REPORT_READY',
} as const

export const SPECIALIZATIONS = [
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Pediatrician',
    'Orthopedic',
    'Gynecologist',
    'Neurologist',
    'Psychiatrist',
    'ENT Specialist',
    'Ophthalmologist',
    'Dentist',
    'Urologist',
    'Gastroenterologist',
    'Pulmonologist',
    'Endocrinologist',
    'Oncologist',
    'Radiologist',
    'Anesthesiologist',
    'Pathologist',
    'Other',
] as const

export const BLOOD_GROUPS = [
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-',
] as const

export const GENDERS = [
    'Male',
    'Female',
    'Other',
    'Prefer not to say',
] as const

export const DAYS_OF_WEEK = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
] as const

export const RECORD_TYPES = [
    'Consultation',
    'Surgery',
    'Imaging',
    'Lab Test',
    'Vaccination',
    'Other',
] as const

export const SLOT_DURATIONS = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
] as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',

    // Patient routes
    PATIENT_DASHBOARD: '/patient/dashboard',
    PATIENT_APPOINTMENTS: '/patient/appointments',
    PATIENT_DOCTORS: '/patient/doctors',
    PATIENT_MEDICAL_RECORDS: '/patient/medical-records',
    PATIENT_CHAT: '/patient/chat',
    PATIENT_PROFILE: '/patient/profile',

    // Doctor routes
    DOCTOR_DASHBOARD: '/doctor/dashboard',
    DOCTOR_APPOINTMENTS: '/doctor/appointments',
    DOCTOR_PATIENTS: '/doctor/patients',
    DOCTOR_SCHEDULE: '/doctor/schedule',
    DOCTOR_CHAT: '/doctor/chat',
    DOCTOR_PROFILE: '/doctor/profile',

    // Admin routes
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_USERS: '/admin/users',
    ADMIN_ANALYTICS: '/admin/analytics',
    ADMIN_SETTINGS: '/admin/settings',
} as const
