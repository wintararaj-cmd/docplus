import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
    Calendar,
    Clock,
    User,
    Phone,
    Mail,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowLeft,
    MapPin
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppointmentActions from "@/components/doctor/AppointmentActions";

export default async function AppointmentDetails({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    const appointment = await prisma.appointment.findUnique({
        where: { id: params.id },
        include: {
            patient: {
                include: {
                    user: true,
                    medicalRecords: {
                        orderBy: { createdAt: 'desc' },
                        take: 3
                    },
                    appointments: {
                        where: {
                            NOT: {
                                id: params.id
                            }
                        },
                        orderBy: { appointmentDate: 'desc' },
                        take: 3
                    }
                },
            },
        },
    });

    if (!appointment) {
        notFound();
    }

    // Ensure doctor owns this appointment
    // In a real app we might want stricter checks, but Prisma unique + session validation usually happens.
    // However, here we just fetch by ID. We should check if the logged in doctor is the one for this appointment.
    const doctor = await prisma.doctor.findUnique({
        where: { userId: session?.user.id }
    });

    if (!doctor || appointment.doctorId !== doctor.id) {
        return <div className="p-8 text-center text-red-600">Unauthorized access to this appointment.</div>;
    }

    // Calculate age (Copy of logic from API)
    let age = "N/A";
    if (appointment.patient.dateOfBirth) {
        const today = new Date();
        const dob = new Date(appointment.patient.dateOfBirth);
        let ageNum = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            ageNum--;
        }
        age = ageNum.toString();
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/doctor/appointments">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Appointment Details</h1>
                    <p className="text-gray-600">
                        Date: {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.startTime}
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                    <AppointmentActions appointmentId={appointment.id} status={appointment.status} />
                    {appointment.status === 'CONFIRMED' && (
                        <Link href={`/doctor/prescriptions/create?appointmentId=${appointment.id}`}>
                            <Button className="bg-emerald-600 hover:bg-emerald-700">
                                Create Prescription
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Appointment Status Card */}
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <div className="flex items-center gap-2">
                                        {appointment.status === 'CONFIRMED' && <CheckCircle className="h-5 w-5 text-blue-500" />}
                                        {appointment.status === 'PENDING' && <AlertCircle className="h-5 w-5 text-orange-500" />}
                                        {appointment.status === 'CANCELLED' && <XCircle className="h-5 w-5 text-red-500" />}
                                        {appointment.status === 'COMPLETED' && <CheckCircle className="h-5 w-5 text-green-500" />}
                                        <span className="text-lg font-semibold">{appointment.status}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-500">Duration</p>
                                    <p className="font-semibold text-gray-900">30 Mins (approx)</p>
                                </div>
                            </div>
                            {appointment.reason && (
                                <div className="mt-6">
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Reason for Visit</h4>
                                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{appointment.reason}</p>
                                </div>
                            )}
                            {appointment.notes && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                                    <p className="text-amber-900 bg-amber-50 p-3 rounded-lg border border-amber-100">{appointment.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Previous Appointments */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Recent History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {appointment.patient.appointments.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No previous appointments</p>
                            ) : (
                                <div className="space-y-4">
                                    {appointment.patient.appointments.map(prev => (
                                        <div key={prev.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {new Date(prev.appointmentDate).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{prev.startTime}</p>
                                                </div>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full ${prev.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {prev.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Patient Profile */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Patient Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-emerald-100 p-4 rounded-full">
                                    <User className="h-8 w-8 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">
                                        {appointment.patient.firstName} {appointment.patient.lastName}
                                    </h3>
                                    <p className="text-sm text-gray-500">{age} years old • {appointment.patient.gender}</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Mail className="h-4 w-4" />
                                    <span className="text-sm">{appointment.patient.user.email}</span>
                                </div>
                                {appointment.patient.phone && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Phone className="h-4 w-4" />
                                        <span className="text-sm">{appointment.patient.phone}</span>
                                    </div>
                                )}
                                {appointment.patient.bloodGroup && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <FileText className="h-4 w-4" />
                                        <span className="text-sm">Blood Group: {appointment.patient.bloodGroup}</span>
                                    </div>
                                )}
                            </div>

                            <Link href={`/doctor/patients/${appointment.patient.id}`} className="block">
                                <Button variant="outline" className="w-full mt-2">
                                    View Full Profile
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
