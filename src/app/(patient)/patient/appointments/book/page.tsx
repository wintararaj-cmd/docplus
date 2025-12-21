'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Calendar as CalendarIcon, Clock, User, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import { format, addDays, isSameDay, parse } from 'date-fns'

interface Doctor {
    id: string
    firstName: string
    lastName: string
    specialization: string
    consultationFee: number
    availability: {
        dayOfWeek: number
        startTime: string
        endTime: string
        slotDuration: number
    }[]
}

export default function BookAppointmentPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const doctorId = searchParams.get('doctorId')

    const [doctor, setDoctor] = useState<Doctor | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedTime, setSelectedTime] = useState('')
    const [reason, setReason] = useState('')
    const [notes, setNotes] = useState('')
    const [availableSlots, setAvailableSlots] = useState<string[]>([])

    useEffect(() => {
        if (doctorId) {
            fetchDoctorDetails()
        }
    }, [doctorId])

    useEffect(() => {
        if (selectedDate && doctor) {
            generateTimeSlots()
        }
    }, [selectedDate, doctor])

    const fetchDoctorDetails = async () => {
        try {
            const response = await fetch(`/api/doctors/${doctorId}`)
            const data = await response.json()
            if (data.success) {
                setDoctor(data.doctor)
            }
        } catch (error) {
            toast.error('Failed to load doctor details')
        } finally {
            setLoading(false)
        }
    }

    const generateTimeSlots = () => {
        if (!selectedDate || !doctor) return

        const dayOfWeek = selectedDate.getDay()
        const availability = doctor.availability.find(a => a.dayOfWeek === dayOfWeek)

        if (!availability) {
            setAvailableSlots([])
            return
        }

        const slots: string[] = []
        const startTime = parse(availability.startTime, 'HH:mm', new Date())
        const endTime = parse(availability.endTime, 'HH:mm', new Date())
        const slotDuration = availability.slotDuration

        let currentTime = startTime
        while (currentTime < endTime) {
            slots.push(format(currentTime, 'HH:mm'))
            currentTime = new Date(currentTime.getTime() + slotDuration * 60000)
        }

        setAvailableSlots(slots)
    }

    const getAvailableDates = () => {
        if (!doctor) return []

        const dates: Date[] = []
        const today = new Date()

        // Generate next 30 days
        for (let i = 0; i < 30; i++) {
            const date = addDays(today, i)
            const dayOfWeek = date.getDay()

            // Check if doctor is available on this day
            const hasAvailability = doctor.availability.some(a => a.dayOfWeek === dayOfWeek)
            if (hasAvailability) {
                dates.push(date)
            }
        }

        return dates
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedDate || !selectedTime || !reason) {
            toast.error('Please fill all required fields')
            return
        }

        setSubmitting(true)

        try {
            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctorId,
                    appointmentDate: selectedDate.toISOString(),
                    startTime: selectedTime,
                    reason,
                    notes
                })
            })

            const data = await response.json()

            if (data.success) {
                toast.success('Appointment booked successfully!')
                router.push('/patient/appointments')
            } else {
                toast.error(data.error || 'Failed to book appointment')
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!doctor) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="text-gray-600">Doctor not found</p>
                </CardContent>
            </Card>
        )
    }

    const availableDates = getAvailableDates()

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Appointment</h1>
                <p className="text-gray-600">Schedule a consultation with Dr. {doctor.firstName} {doctor.lastName}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Booking Form */}
                <div className="lg:col-span-2">
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Appointment Details</CardTitle>
                            <CardDescription>Fill in the information below to book your appointment</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Date Selection */}
                                <div className="space-y-2">
                                    <Label>Select Date *</Label>
                                    <Select
                                        value={selectedDate ? selectedDate.toISOString() : ''}
                                        onValueChange={(value) => {
                                            setSelectedDate(new Date(value))
                                            setSelectedTime('')
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a date" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableDates.map((date) => (
                                                <SelectItem key={date.toISOString()} value={date.toISOString()}>
                                                    {format(date, 'EEEE, MMMM dd, yyyy')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Time Selection */}
                                {selectedDate && (
                                    <div className="space-y-2">
                                        <Label>Select Time *</Label>
                                        {availableSlots.length === 0 ? (
                                            <p className="text-sm text-gray-500">No available slots for this date</p>
                                        ) : (
                                            <div className="grid grid-cols-4 gap-2">
                                                {availableSlots.map((slot) => (
                                                    <Button
                                                        key={slot}
                                                        type="button"
                                                        variant={selectedTime === slot ? 'default' : 'outline'}
                                                        className={selectedTime === slot ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
                                                        onClick={() => setSelectedTime(slot)}
                                                    >
                                                        {slot}
                                                    </Button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Reason */}
                                <div className="space-y-2">
                                    <Label htmlFor="reason">Reason for Visit *</Label>
                                    <Input
                                        id="reason"
                                        placeholder="e.g., Regular checkup, Follow-up consultation"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Any specific symptoms or concerns you'd like to mention"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={4}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Booking...' : 'Confirm Booking'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Summary Card */}
                <div className="lg:col-span-1">
                    <Card className="border-0 shadow-lg sticky top-24">
                        <CardHeader>
                            <CardTitle className="text-lg">Booking Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Doctor</p>
                                <p className="font-semibold text-gray-900">
                                    Dr. {doctor.firstName} {doctor.lastName}
                                </p>
                                <p className="text-sm text-gray-600">{doctor.specialization}</p>
                            </div>

                            {selectedDate && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Date</p>
                                    <div className="flex items-center space-x-2">
                                        <CalendarIcon className="w-4 h-4 text-blue-600" />
                                        <p className="font-semibold text-gray-900">
                                            {format(selectedDate, 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {selectedTime && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Time</p>
                                    <div className="flex items-center space-x-2">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                        <p className="font-semibold text-gray-900">{selectedTime}</p>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-600">Consultation Fee</p>
                                    <p className="text-2xl font-bold text-blue-600">₹{doctor.consultationFee}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
