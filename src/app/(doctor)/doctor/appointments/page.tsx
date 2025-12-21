import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
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
    AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppointmentActions from "@/components/doctor/AppointmentActions";

export default async function DoctorAppointments() {
    const session = await getServerSession(authOptions);

    const doctor = await prisma.doctor.findUnique({
        where: { userId: session?.user.id },
        include: {
            appointments: {
                include: {
                    patient: {
                        include: {
                            user: true,
                        },
                    },
                },
                orderBy: {
                    appointmentDate: "desc",
                },
            },
        },
    });

    if (!doctor) {
        return <div>Doctor profile not found</div>;
    }

    const now = new Date();

    const pendingAppointments = doctor.appointments.filter(
        (apt) => apt.status === "PENDING"
    );

    const upcomingAppointments = doctor.appointments.filter(
        (apt) => new Date(apt.appointmentDate) >= now && apt.status === "CONFIRMED"
    );

    const pastAppointments = doctor.appointments.filter(
        (apt) => new Date(apt.appointmentDate) < now || apt.status === "COMPLETED"
    );

    const cancelledAppointments = doctor.appointments.filter(
        (apt) => apt.status === "CANCELLED"
    );

    const renderAppointmentCard = (appointment: any) => (
        <Card key={appointment.id} className="hover:shadow-lg transition-shadow bg-white">
            <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1 w-full">
                        {/* Patient Avatar */}
                        <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-4 rounded-xl hidden sm:block">
                            <User className="h-6 w-6 text-emerald-600" />
                        </div>

                        {/* Appointment Details */}
                        <div className="flex-1 space-y-3 w-full">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {appointment.patient.firstName} {appointment.patient.lastName}
                                </h3>
                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                                    <div className="flex items-center space-x-1">
                                        <Mail className="h-4 w-4" />
                                        <span>{appointment.patient.user.email}</span>
                                    </div>
                                    {appointment.patient.phone && (
                                        <div className="flex items-center space-x-1">
                                            <Phone className="h-4 w-4" />
                                            <span>{appointment.patient.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-6 text-sm">
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-700">
                                        {new Date(appointment.appointmentDate).toLocaleDateString("en-US", {
                                            weekday: "long",
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-700">
                                        {appointment.startTime}
                                    </span>
                                </div>
                            </div>

                            {appointment.reason && (
                                <div className="flex items-start space-x-2 text-sm">
                                    <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <span className="font-medium text-gray-700">Reason: </span>
                                        <span className="text-gray-600">{appointment.reason}</span>
                                    </div>
                                </div>
                            )}

                            {appointment.notes && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                                    <span className="font-medium text-amber-900">Notes: </span>
                                    <span className="text-amber-800">{appointment.notes}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col items-end space-y-3 w-full lg:w-auto">
                        <div className="flex items-center space-x-2">
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${appointment.status === "CONFIRMED"
                                    ? "bg-blue-100 text-blue-700"
                                    : appointment.status === "COMPLETED"
                                        ? "bg-green-100 text-green-700"
                                        : appointment.status === "PENDING"
                                            ? "bg-orange-100 text-orange-700"
                                            : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {appointment.status}
                            </span>
                        </div>

                        <div className="flex flex-wrap justify-end gap-2 w-full">
                            <AppointmentActions appointmentId={appointment.id} status={appointment.status} />

                            <Link href={`/doctor/appointments/${appointment.id}`}>
                                <Button size="sm" variant="outline">
                                    View Details
                                </Button>
                            </Link>

                            {appointment.status === "CONFIRMED" && (
                                <>
                                    <Link href={`/doctor/patients/${appointment.patient.id}`}>
                                        <Button size="sm" variant="outline">
                                            Patient Profile
                                        </Button>
                                    </Link>
                                    <Link href={`/doctor/prescriptions/create?appointmentId=${appointment.id}`}>
                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                            Rx
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
                <p className="text-gray-600 mt-1">
                    Manage your patient appointments and requests
                </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-3xl font-bold text-orange-600 mt-2">
                                    {pendingAppointments.length}
                                </p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-xl">
                                <AlertCircle className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">
                                    {upcomingAppointments.length}
                                </p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-xl">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">
                                    {pastAppointments.length}
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-xl">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                                <p className="text-3xl font-bold text-red-600 mt-2">
                                    {cancelledAppointments.length}
                                </p>
                            </div>
                            <div className="bg-red-100 p-3 rounded-xl">
                                <XCircle className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Appointments Tabs */}
            <Tabs defaultValue="requests" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="requests">
                        Requests ({pendingAppointments.length})
                    </TabsTrigger>
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

                <TabsContent value="requests" className="space-y-4">
                    {pendingAppointments.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No pending requests
                                </h3>
                                <p className="text-gray-600">
                                    You're all caught up! New appointment requests will appear here.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        pendingAppointments.map(renderAppointmentCard)
                    )}
                </TabsContent>

                <TabsContent value="upcoming" className="space-y-4">
                    {upcomingAppointments.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No upcoming appointments
                                </h3>
                                <p className="text-gray-600">
                                    You don't have any confirmed appointments coming up.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        upcomingAppointments.map(renderAppointmentCard)
                    )}
                </TabsContent>

                <TabsContent value="past" className="space-y-4">
                    {pastAppointments.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No past appointments
                                </h3>
                                <p className="text-gray-600">
                                    Your completed history will be shown here.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        pastAppointments.map(renderAppointmentCard)
                    )}
                </TabsContent>

                <TabsContent value="cancelled" className="space-y-4">
                    {cancelledAppointments.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No cancelled appointments
                                </h3>
                                <p className="text-gray-600">
                                    Cancelled appointments will appear here.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        cancelledAppointments.map(renderAppointmentCard)
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
