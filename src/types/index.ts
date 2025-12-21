import { UserRole, AppointmentStatus, MessageType, NotificationType } from '@prisma/client'

export interface User {
    id: string
    email: string
    phone: string | null
    role: UserRole
    emailVerified: boolean
    phoneVerified: boolean
    twoFactorEnabled: boolean
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

export interface Patient {
    id: string
    userId: string
    firstName: string
    lastName: string
    dateOfBirth: Date
    gender: string
    bloodGroup: string | null
    address: string | null
    city: string | null
    state: string | null
    zipCode: string | null
    emergencyContact: string | null
    emergencyPhone: string | null
    insuranceProvider: string | null
    insuranceNumber: string | null
    allergies: string | null
    chronicConditions: string | null
    createdAt: Date
    updatedAt: Date
    user?: User
}

export interface Doctor {
    id: string
    userId: string
    firstName: string
    lastName: string
    specialization: string
    qualification: string
    experience: number
    licenseNumber: string
    licenseVerified: boolean
    consultationFee: number
    about: string | null
    address: string | null
    city: string | null
    state: string | null
    zipCode: string | null
    rating: number
    totalReviews: number
    isAvailable: boolean
    createdAt: Date
    updatedAt: Date
    user?: User
}

export interface Appointment {
    id: string
    patientId: string
    doctorId: string
    appointmentDate: Date
    startTime: string
    endTime: string
    status: AppointmentStatus
    reason: string | null
    notes: string | null
    cancelReason: string | null
    reminderSent: boolean
    createdAt: Date
    updatedAt: Date
    patient?: Patient
    doctor?: Doctor
}

export interface DoctorAvailability {
    id: string
    doctorId: string
    dayOfWeek: number
    startTime: string
    endTime: string
    slotDuration: number
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

export interface MedicalRecord {
    id: string
    patientId: string
    title: string
    description: string | null
    recordType: string
    recordDate: Date
    fileUrl: string | null
    fileName: string | null
    fileSize: number | null
    uploadedBy: string | null
    createdAt: Date
    updatedAt: Date
}

export interface Medication {
    name: string
    dosage: string
    frequency: string
    duration: string
}

export interface Prescription {
    id: string
    patientId: string
    doctorId: string
    diagnosis: string
    medications: Medication[]
    instructions: string | null
    followUpDate: Date | null
    prescriptionDate: Date
    createdAt: Date
    updatedAt: Date
    patient?: Patient
    doctor?: Doctor
}

export interface LabReport {
    id: string
    patientId: string
    testName: string
    testDate: Date
    results: Record<string, any>
    fileUrl: string | null
    fileName: string | null
    remarks: string | null
    createdAt: Date
    updatedAt: Date
}

export interface Message {
    id: string
    patientId: string
    doctorId: string
    senderId: string
    content: string
    messageType: MessageType
    status: string
    fileUrl: string | null
    fileName: string | null
    isEmergency: boolean
    resolvedAt: Date | null
    createdAt: Date
    updatedAt: Date
    patient?: Patient
    doctor?: Doctor
}

export interface Notification {
    id: string
    userId: string
    type: NotificationType
    title: string
    message: string
    isRead: boolean
    metadata: Record<string, any> | null
    createdAt: Date
}

export interface Review {
    id: string
    doctorId: string
    patientName: string
    rating: number
    comment: string | null
    createdAt: Date
}

export interface AuditLog {
    id: string
    userId: string
    action: string
    resource: string
    resourceId: string
    metadata: Record<string, any> | null
    ipAddress: string | null
    userAgent: string | null
    createdAt: Date
}

// API Response types
export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

// Session types
export interface SessionUser {
    id: string
    email: string
    role: UserRole
    patientId?: string
    doctorId?: string
}

// Search and filter types
export interface DoctorSearchFilters {
    specialization?: string
    city?: string
    minRating?: number
    maxFee?: number
    availability?: boolean
    search?: string
}

export interface AppointmentFilters {
    status?: AppointmentStatus
    startDate?: string
    endDate?: string
    doctorId?: string
    patientId?: string
}
