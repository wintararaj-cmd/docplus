import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerPatientSchema = z.object({
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    dateOfBirth: z.string(),
    gender: z.string(),
    bloodGroup: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
})

export const registerDoctorSchema = z.object({
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    specialization: z.string().min(2, 'Specialization is required'),
    qualification: z.string().min(2, 'Qualification is required'),
    experience: z.number().min(0, 'Experience must be a positive number'),
    licenseNumber: z.string().min(5, 'License number is required'),
    consultationFee: z.number().min(0, 'Consultation fee must be a positive number'),
    about: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
})

// Profile schemas
export const updatePatientProfileSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    dateOfBirth: z.string(),
    gender: z.string(),
    bloodGroup: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    emergencyContact: z.string().optional(),
    emergencyPhone: z.string().optional(),
    insuranceProvider: z.string().optional(),
    insuranceNumber: z.string().optional(),
    allergies: z.string().optional(),
    chronicConditions: z.string().optional(),
})

export const updateDoctorProfileSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    specialization: z.string().min(2, 'Specialization is required'),
    qualification: z.string().min(2, 'Qualification is required'),
    experience: z.number().min(0, 'Experience must be a positive number'),
    consultationFee: z.number().min(0, 'Consultation fee must be a positive number'),
    about: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    isAvailable: z.boolean().optional(),
})

// Appointment schemas
export const createAppointmentSchema = z.object({
    doctorId: z.string().min(1, 'Doctor is required'),
    appointmentDate: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    reason: z.string().optional(),
})

export const updateAppointmentSchema = z.object({
    appointmentDate: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']).optional(),
    notes: z.string().optional(),
    cancelReason: z.string().optional(),
})

// Doctor availability schema
export const doctorAvailabilitySchema = z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    slotDuration: z.number().min(15).max(120).optional(),
    isActive: z.boolean().optional(),
})

// Medical record schema
export const createMedicalRecordSchema = z.object({
    title: z.string().min(2, 'Title is required'),
    description: z.string().optional(),
    recordType: z.string().min(1, 'Record type is required'),
    recordDate: z.string(),
    fileUrl: z.string().optional(),
    fileName: z.string().optional(),
    fileSize: z.number().optional(),
})

// Prescription schema
export const createPrescriptionSchema = z.object({
    patientId: z.string().min(1, 'Patient is required'),
    diagnosis: z.string().min(2, 'Diagnosis is required'),
    medications: z.array(z.object({
        name: z.string().min(1, 'Medication name is required'),
        dosage: z.string().min(1, 'Dosage is required'),
        frequency: z.string().min(1, 'Frequency is required'),
        duration: z.string().min(1, 'Duration is required'),
    })),
    instructions: z.string().optional(),
    followUpDate: z.string().optional(),
})

// Message schema
export const sendMessageSchema = z.object({
    recipientId: z.string().min(1, 'Recipient is required'),
    content: z.string().min(1, 'Message content is required'),
    isEmergency: z.boolean().optional(),
    fileUrl: z.string().optional(),
    fileName: z.string().optional(),
})

// Lab report schema
export const createLabReportSchema = z.object({
    patientId: z.string().min(1, 'Patient is required'),
    testName: z.string().min(2, 'Test name is required'),
    testDate: z.string(),
    results: z.record(z.any()),
    fileUrl: z.string().optional(),
    fileName: z.string().optional(),
    remarks: z.string().optional(),
})

// Review schema
export const createReviewSchema = z.object({
    doctorId: z.string().min(1, 'Doctor is required'),
    patientName: z.string().min(2, 'Name is required'),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
})

// Export types
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterPatientInput = z.infer<typeof registerPatientSchema>
export type RegisterDoctorInput = z.infer<typeof registerDoctorSchema>
export type UpdatePatientProfileInput = z.infer<typeof updatePatientProfileSchema>
export type UpdateDoctorProfileInput = z.infer<typeof updateDoctorProfileSchema>
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>
export type DoctorAvailabilityInput = z.infer<typeof doctorAvailabilitySchema>
export type CreateMedicalRecordInput = z.infer<typeof createMedicalRecordSchema>
export type CreatePrescriptionInput = z.infer<typeof createPrescriptionSchema>
export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type CreateLabReportInput = z.infer<typeof createLabReportSchema>
export type CreateReviewInput = z.infer<typeof createReviewSchema>
