import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { Calendar, FileText, Activity, Clock, AlertCircle, CheckCircle, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'

async function getPatientData(userId: string) {
    const patient = await prisma.patient.findUnique({
        where: { userId },
        include: {
            appointments: {
                include: {
                    doctor: {
                        include: {
                            user: true
                        }
                    }
                },
                orderBy: {
                    appointmentDate: 'desc'
                },
                take: 5
            },
            medicalRecords: {
                orderBy: {
                    recordDate: 'desc'
                },
                take: 5
            },
            prescriptions: {
                include: {
                    doctor: {
                        include: {
                            user: true
                        }
                    }
                },
                orderBy: {
                    prescriptionDate: 'desc'
                },
                take: 3
            }
        }
    })

    return patient
}

export default async function PatientDashboard() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return null
    }

    const patient = await getPatientData(session.user.id)

    if (!patient) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>Complete Your Profile</CardTitle>
                        <CardDescription>
                            Please complete your patient profile to access the dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/patient/profile">
                            <Button className="w-full">Complete Profile</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const upcomingAppointments = patient.appointments.filter(
        apt => apt.status === 'CONFIRMED' && new Date(apt.appointmentDate) > new Date()
    )

    const stats = [
        {
            title: 'Upcoming Appointments',
            value: upcomingAppointments.length,
            icon: Calendar,
            color: 'from-blue-500 to-blue-600',
            href: '/patient/appointments'
        },
        {
            title: 'Medical Records',
            value: patient.medicalRecords.length,
            icon: FileText,
            color: 'from-purple-500 to-purple-600',
            href: '/patient/medical-records'
        },
        {
            title: 'Prescriptions',
            value: patient.prescriptions.length,
            icon: Activity,
            color: 'from-green-500 to-green-600',
            href: '/patient/medical-records'
        },
        {
            title: 'Total Appointments',
            value: patient.appointments.length,
            icon: Clock,
            color: 'from-orange-500 to-orange-600',
            href: '/patient/appointments'
        }
    ]

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                <h1 className="text-3xl font-bold mb-2">
                    Welcome back, {patient.firstName}! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                    Here's your health overview for today
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <Link key={stat.title} href={stat.href}>
                            <Card className="hover:shadow-lg transition-all cursor-pointer border-0 bg-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 mb-1">
                                                {stat.title}
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900">
                                                {stat.value}
                                            </p>
                                        </div>
                                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                                            <Icon className="w-7 h-7 text-white" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    )
                })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Appointments */}
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl">Upcoming Appointments</CardTitle>
                                <CardDescription>Your scheduled consultations</CardDescription>
                            </div>
                            <Link href="/patient/appointments">
                                <Button variant="ghost" size="sm">View All</Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {upcomingAppointments.length === 0 ? (
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 mb-4">No upcoming appointments</p>
                                <Link href="/patient/doctors">
                                    <Button>Book Appointment</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upcomingAppointments.slice(0, 3).map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className="flex items-start space-x-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100"
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                                            {format(new Date(appointment.appointmentDate), 'dd')}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">
                                                Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {appointment.doctor.specialization}
                                            </p>
                                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                                <span className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}
                                                </span>
                                                <span className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    {appointment.startTime}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Medical Records */}
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl">Recent Medical Records</CardTitle>
                                <CardDescription>Your latest health documents</CardDescription>
                            </div>
                            <Link href="/patient/medical-records">
                                <Button variant="ghost" size="sm">View All</Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {patient.medicalRecords.length === 0 ? (
                            <div className="text-center py-8">
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 mb-4">No medical records yet</p>
                                <Link href="/patient/medical-records">
                                    <Button>Upload Record</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {patient.medicalRecords.slice(0, 4).map((record) => (
                                    <div
                                        key={record.id}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{record.title}</p>
                                                <p className="text-sm text-gray-500">
                                                    {format(new Date(record.recordDate), 'MMM dd, yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                                            {record.recordType}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Prescriptions */}
            {patient.prescriptions.length > 0 && (
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl">Recent Prescriptions</CardTitle>
                        <CardDescription>Your latest medication prescriptions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {patient.prescriptions.map((prescription) => (
                                <div
                                    key={prescription.id}
                                    className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                Dr. {prescription.doctor.firstName} {prescription.doctor.lastName}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {format(new Date(prescription.prescriptionDate), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">
                                            Active
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-sm font-medium text-gray-700 mb-1">Diagnosis:</p>
                                        <p className="text-sm text-gray-900">{prescription.diagnosis}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardHeader>
                    <CardTitle className="text-xl text-white">Quick Actions</CardTitle>
                    <CardDescription className="text-blue-100">
                        Common tasks you might want to do
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href="/patient/doctors">
                            <Button variant="secondary" className="w-full h-auto py-4 flex flex-col items-center space-y-2">
                                <Users className="w-6 h-6" />
                                <span>Find a Doctor</span>
                            </Button>
                        </Link>
                        <Link href="/patient/appointments">
                            <Button variant="secondary" className="w-full h-auto py-4 flex flex-col items-center space-y-2">
                                <Calendar className="w-6 h-6" />
                                <span>Book Appointment</span>
                            </Button>
                        </Link>
                        <Link href="/patient/chat">
                            <Button variant="secondary" className="w-full h-auto py-4 flex flex-col items-center space-y-2">
                                <AlertCircle className="w-6 h-6" />
                                <span>Emergency Chat</span>
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
