import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
    Users,
    UserCheck,
    UserX,
    Stethoscope,
    Calendar,
    FileText,
    Shield
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);

    // Get statistics
    const [
        totalUsers,
        totalPatients,
        totalDoctors,
        verifiedDoctors,
        pendingDoctors,
        totalAppointments,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.patient.count(),
        prisma.doctor.count(),
        prisma.doctor.count({ where: { licenseVerified: true } }),
        prisma.doctor.count({ where: { licenseVerified: false } }),
        prisma.appointment.count(),
    ]);

    const stats = [
        {
            title: "Total Users",
            value: totalUsers,
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "Patients",
            value: totalPatients,
            icon: UserCheck,
            color: "text-green-600",
            bgColor: "bg-green-100",
        },
        {
            title: "Verified Doctors",
            value: verifiedDoctors,
            icon: Stethoscope,
            color: "text-emerald-600",
            bgColor: "bg-emerald-100",
        },
        {
            title: "Pending Verification",
            value: pendingDoctors,
            icon: UserX,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
        },
        {
            title: "Total Appointments",
            value: totalAppointments,
            icon: Calendar,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1">
                        Welcome back, {session?.user.email}
                    </p>
                </div>
                <div className="bg-gradient-to-r from-red-100 to-orange-100 px-6 py-3 rounded-xl">
                    <div className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-red-600" />
                        <span className="text-sm font-semibold text-red-900">ADMIN</span>
                    </div>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
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

            {/* Pending Verification Alert */}
            {pendingDoctors > 0 && (
                <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="bg-orange-100 p-3 rounded-xl">
                                    <UserX className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {pendingDoctors} Doctor{pendingDoctors > 1 ? 's' : ''} Pending Verification
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Review and verify doctor credentials to activate their accounts
                                    </p>
                                </div>
                            </div>
                            <Link href="/admin/doctors/pending">
                                <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                                    Review Now
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href="/admin/doctors/pending">
                            <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                                <UserX className="h-4 w-4 mr-2" />
                                Verify Doctors
                            </Button>
                        </Link>
                        <Link href="/admin/doctors">
                            <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                                <Stethoscope className="h-4 w-4 mr-2" />
                                Manage Doctors
                            </Button>
                        </Link>
                        <Link href="/admin/users">
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                                <Users className="h-4 w-4 mr-2" />
                                Manage Users
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
