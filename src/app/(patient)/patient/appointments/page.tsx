'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, User, MapPin, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'

interface Appointment {
    id: string
    appointmentDate: string
    startTime: string
    endTime: string
    status: string
    reason: string
    notes?: string
    doctor: {
        id: string
        firstName: string
        lastName: string
        specialization: string
        consultationFee: number
    }
}

const statusConfig = {
    PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    CONFIRMED: { label: 'Confirmed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    COMPLETED: { label: 'Completed', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: X },
    RESCHEDULED: { label: 'Rescheduled', color: 'bg-purple-100 text-purple-700', icon: AlertCircle }
}

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('upcoming')

    useEffect(() => {
        fetchAppointments()
    }, [])

    const fetchAppointments = async () => {
        try {
            const response = await fetch('/api/appointments')
            const data = await response.json()
            if (data.success) {
                setAppointments(data.appointments || [])
            }
        } catch (error) {
            toast.error('Failed to load appointments')
        } finally {
            setLoading(false)
        }
    }

    const handleCancelAppointment = async (appointmentId: string) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) {
            return
        }

        try {
            const response = await fetch(`/api/appointments/${appointmentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'CANCELLED' })
            })

            const data = await response.json()
            if (data.success) {
                toast.success('Appointment cancelled successfully')
                fetchAppointments()
            } else {
                toast.error(data.error || 'Failed to cancel appointment')
            }
        } catch (error) {
            toast.error('An error occurred')
        }
    }

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }

    const filterAppointments = (status: 'upcoming' | 'past' | 'cancelled') => {
        const now = new Date()

        return appointments.filter(apt => {
            const aptDate = new Date(apt.appointmentDate)

            if (status === 'upcoming') {
                return aptDate >= now && apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED'
            } else if (status === 'past') {
                return aptDate < now || apt.status === 'COMPLETED'
            } else {
                return apt.status === 'CANCELLED'
            }
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    const upcomingAppointments = filterAppointments('upcoming')
    const pastAppointments = filterAppointments('past')
    const cancelledAppointments = filterAppointments('cancelled')

    const renderAppointmentCard = (appointment: Appointment) => {
        const StatusIcon = statusConfig[appointment.status as keyof typeof statusConfig]?.icon || Clock
        const statusStyle = statusConfig[appointment.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-700'
        const statusLabel = statusConfig[appointment.status as keyof typeof statusConfig]?.label || appointment.status

        return (
            <Card key={appointment.id} className="border-0 shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4 flex-1">
                            <Avatar className="w-14 h-14">
                                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold">
                                    {getInitials(appointment.doctor.firstName, appointment.doctor.lastName)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                                <h3 className="font-semibold text-lg text-gray-900">
                                    Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                                </h3>
                                <p className="text-sm text-gray-600">{appointment.doctor.specialization}</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                                        {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Clock className="w-4 h-4 mr-2 text-blue-600" />
                                        {appointment.startTime} - {appointment.endTime}
                                    </div>
                                </div>

                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs font-medium text-gray-700 mb-1">Reason for visit:</p>
                                    <p className="text-sm text-gray-900">{appointment.reason}</p>
                                    {appointment.notes && (
                                        <>
                                            <p className="text-xs font-medium text-gray-700 mt-2 mb-1">Notes:</p>
                                            <p className="text-sm text-gray-600">{appointment.notes}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                            <span className={`text-xs font-medium px-3 py-1 rounded-full flex items-center space-x-1 ${statusStyle}`}>
                                <StatusIcon className="w-3 h-3" />
                                <span>{statusLabel}</span>
                            </span>
                            <p className="text-sm font-semibold text-gray-900">₹{appointment.doctor.consultationFee}</p>
                        </div>
                    </div>

                    {appointment.status === 'PENDING' || appointment.status === 'CONFIRMED' ? (
                        <div className="flex items-center space-x-2 pt-4 border-t">
                            <Link href={`/patient/doctors/${appointment.doctor.id}`} className="flex-1">
                                <Button variant="outline" className="w-full">
                                    View Doctor
                                </Button>
                            </Link>
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={() => handleCancelAppointment(appointment.id)}
                            >
                                Cancel
                            </Button>
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
                    <p className="text-gray-600">Manage your scheduled consultations</p>
                </div>
                <Link href="/patient/doctors">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        <Calendar className="w-4 h-4 mr-2" />
                        Book New Appointment
                    </Button>
                </Link>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger value="upcoming">
                        Upcoming ({upcomingAppointments.length})
                    </TabsTrigger>
                    <TabsTrigger value="past">
                        Past ({pastAppointments.length})
                    </TabsTrigger>
                    <TabsTrigger value="cancelled">
                        Cancelled ({cancelledAppointments.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-4 mt-6">
                    {upcomingAppointments.length === 0 ? (
                        <Card className="border-0 shadow-lg">
                            <CardContent className="py-12 text-center">
                                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No upcoming appointments</h3>
                                <p className="text-gray-600 mb-6">Book an appointment with a doctor to get started</p>
                                <Link href="/patient/doctors">
                                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                                        Find a Doctor
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        upcomingAppointments.map(renderAppointmentCard)
                    )}
                </TabsContent>

                <TabsContent value="past" className="space-y-4 mt-6">
                    {pastAppointments.length === 0 ? (
                        <Card className="border-0 shadow-lg">
                            <CardContent className="py-12 text-center">
                                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No past appointments</h3>
                                <p className="text-gray-600">Your completed appointments will appear here</p>
                            </CardContent>
                        </Card>
                    ) : (
                        pastAppointments.map(renderAppointmentCard)
                    )}
                </TabsContent>

                <TabsContent value="cancelled" className="space-y-4 mt-6">
                    {cancelledAppointments.length === 0 ? (
                        <Card className="border-0 shadow-lg">
                            <CardContent className="py-12 text-center">
                                <X className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No cancelled appointments</h3>
                                <p className="text-gray-600">Your cancelled appointments will appear here</p>
                            </CardContent>
                        </Card>
                    ) : (
                        cancelledAppointments.map(renderAppointmentCard)
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
