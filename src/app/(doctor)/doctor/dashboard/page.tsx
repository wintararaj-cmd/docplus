import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
    Calendar,
    Users,
    FileText,
    Clock,
    TrendingUp,
    CheckCircle,
    XCircle,
    AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DoctorDashboard() {
    const session = await getServerSession(authOptions);

    // Fetch doctor data
    const doctor = await prisma.doctor.findUnique({
        where: { userId: session?.user.id },
        include: {
            user: true,
            appointments: {
                include: {
                    patient: {
                        include: {
                            user: true,
                        },
                    },
                },
                orderBy: {
                    appointmentDate: "asc",
                },
            },
            prescriptions: true,
        },
    });

    if (!doctor) {
        return (
            <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-900">
                    Doctor profile not found
                </h1>
                <p className="text-gray-600 mt-2">
                    Please complete your doctor profile setup.
                </p>
            </div>
        );
    }

    // Calculate statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = doctor.appointments.filter(
        (apt) => {
            const aptDate = new Date(apt.appointmentDate);
            return aptDate >= today && aptDate < tomorrow;
        }
    );

    const upcomingAppointments = doctor.appointments.filter(
        (apt) => new Date(apt.appointmentDate) >= today && apt.status === "CONFIRMED"
    ).slice(0, 5);

    const completedAppointments = doctor.appointments.filter(
        (apt) => apt.status === "COMPLETED"
    ).length;

    const cancelledAppointments = doctor.appointments.filter(
        (apt) => apt.status === "CANCELLED"
    ).length;

    const totalPatients = new Set(
        doctor.appointments.map((apt) => apt.patientId)
    ).size;

    const stats = [
        {
            title: "Today's Appointments",
            value: todayAppointments.length,
            icon: Calendar,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "Total Patients",
            value: totalPatients,
            icon: Users,
            color: "text-emerald-600",
            bgColor: "bg-emerald-100",
        },
        {
            title: "Prescriptions",
            value: doctor.prescriptions.length,
            icon: FileText,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
        },
        {
            title: "Completed",
            value: completedAppointments,
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-100",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white shadow-lg">
                <h1 className="text-3xl font-bold mb-2">
                    Welcome back, Dr. {doctor.firstName} {doctor.lastName}!
                </h1>
                <p className="text-emerald-100">
                    {doctor.specialization} • {doctor.experience} years of experience
                </p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            {stat.title}
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">
                                            {stat.value}
                                        </p>
                                    </div>
                                    <div className={`${stat.bgColor} p-3 rounded-xl`}>
                                        <Icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                        <span>Quick Actions</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href="/doctor/appointments">
                            <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                                <Calendar className="h-4 w-4 mr-2" />
                                View Appointments
                            </Button>
                        </Link>
                        <Link href="/doctor/schedule">
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                                <Clock className="h-4 w-4 mr-2" />
                                Manage Schedule
                            </Button>
                        </Link>
                        <Link href="/doctor/patients">
                            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                                <Users className="h-4 w-4 mr-2" />
                                View Patients
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-emerald-600" />
                            <span>Upcoming Appointments</span>
                        </div>
                        <Link href="/doctor/appointments">
                            <Button variant="ghost" size="sm">
                                View All
                            </Button>
                        </Link>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {upcomingAppointments.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No upcoming appointments</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {upcomingAppointments.map((appointment) => (
                                <div
                                    key={appointment.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-emerald-100 p-3 rounded-lg">
                                            <Users className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {appointment.patient.firstName} {appointment.patient.lastName}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(appointment.appointmentDate).toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        weekday: "short",
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    }
                                                )}{" "}
                                                at {appointment.startTime}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${appointment.status === "CONFIRMED"
                                                ? "bg-blue-100 text-blue-700"
                                                : appointment.status === "COMPLETED"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {appointment.status}
                                        </span>
                                        <Link href={`/doctor/appointments/${appointment.id}`}>
                                            <Button size="sm" variant="ghost">
                                                View
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Today's Schedule */}
            {todayAppointments.length > 0 && (
                <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                            <span>Today's Schedule</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {todayAppointments.map((appointment) => (
                                <div
                                    key={appointment.id}
                                    className="flex items-center justify-between p-3 bg-white rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-amber-100 p-2 rounded-lg">
                                            <Clock className="h-4 w-4 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {appointment.startTime}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {appointment.patient.firstName} {appointment.patient.lastName}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${appointment.status === "CONFIRMED"
                                            ? "bg-blue-100 text-blue-700"
                                            : appointment.status === "COMPLETED"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {appointment.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
