import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
    Stethoscope,
    UserCheck,
    UserX,
    Mail,
    Phone,
    Award,
    DollarSign,
    Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DoctorsManagement() {
    const session = await getServerSession(authOptions);

    const doctors = await prisma.doctor.findMany({
        include: {
            user: {
                select: {
                    email: true,
                    phone: true,
                    isActive: true,
                    emailVerified: true,
                    createdAt: true,
                },
            },
            _count: {
                select: {
                    appointments: true,
                    prescriptions: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const stats = {
        total: doctors.length,
        verified: doctors.filter((d) => d.licenseVerified).length,
        pending: doctors.filter((d) => !d.licenseVerified).length,
        active: doctors.filter((d) => d.user.isActive).length,
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Doctors Management
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage all doctors in the system
                    </p>
                </div>
                <Link href="/admin/doctors/pending">
                    <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                        <UserX className="h-4 w-4 mr-2" />
                        Pending Verification ({stats.pending})
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Doctors</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <Stethoscope className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Verified</p>
                                <p className="text-2xl font-bold">{stats.verified}</p>
                            </div>
                            <UserCheck className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-2xl font-bold">{stats.pending}</p>
                            </div>
                            <UserX className="h-8 w-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active</p>
                                <p className="text-2xl font-bold">{stats.active}</p>
                            </div>
                            <UserCheck className="h-8 w-8 text-emerald-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doctor) => (
                    <Card
                        key={doctor.id}
                        className="hover:shadow-lg transition-shadow"
                    >
                        <CardHeader
                            className={`${doctor.licenseVerified
                                    ? "bg-gradient-to-r from-emerald-50 to-teal-50"
                                    : "bg-gradient-to-r from-orange-50 to-red-50"
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-lg">
                                        Dr. {doctor.firstName} {doctor.lastName}
                                    </CardTitle>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {doctor.specialization}
                                    </p>
                                </div>
                                <div
                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${doctor.licenseVerified
                                            ? "bg-green-100 text-green-700"
                                            : "bg-orange-100 text-orange-700"
                                        }`}
                                >
                                    {doctor.licenseVerified ? "VERIFIED" : "PENDING"}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {/* Contact */}
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center space-x-2 text-gray-600">
                                    <Mail className="h-4 w-4" />
                                    <span className="truncate">{doctor.user.email}</span>
                                </div>
                                {doctor.user.phone && (
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <Phone className="h-4 w-4" />
                                        <span>{doctor.user.phone}</span>
                                    </div>
                                )}
                            </div>

                            {/* Professional Info */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-gray-50 p-2 rounded">
                                    <div className="flex items-center space-x-1 text-gray-600 mb-1">
                                        <Award className="h-3 w-3" />
                                        <span className="text-xs">Experience</span>
                                    </div>
                                    <p className="font-semibold">{doctor.experience} years</p>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                    <div className="flex items-center space-x-1 text-gray-600 mb-1">
                                        <DollarSign className="h-3 w-3" />
                                        <span className="text-xs">Fee</span>
                                    </div>
                                    <p className="font-semibold">₹{doctor.consultationFee}</p>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                    <div className="flex items-center space-x-1 text-gray-600 mb-1">
                                        <Stethoscope className="h-3 w-3" />
                                        <span className="text-xs">Appointments</span>
                                    </div>
                                    <p className="font-semibold">{doctor._count.appointments}</p>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                    <div className="flex items-center space-x-1 text-gray-600 mb-1">
                                        <Star className="h-3 w-3" />
                                        <span className="text-xs">Rating</span>
                                    </div>
                                    <p className="font-semibold">
                                        {doctor.rating.toFixed(1)} ({doctor.totalReviews})
                                    </p>
                                </div>
                            </div>

                            {/* License */}
                            <div className="bg-gray-50 p-3 rounded">
                                <p className="text-xs text-gray-600 mb-1">License Number</p>
                                <p className="font-mono text-sm font-semibold">
                                    {doctor.licenseNumber}
                                </p>
                            </div>

                            {/* Status Badges */}
                            <div className="flex flex-wrap gap-2">
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${doctor.user.isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {doctor.user.isActive ? "Active" : "Inactive"}
                                </span>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${doctor.isAvailable
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    {doctor.isAvailable ? "Available" : "Unavailable"}
                                </span>
                                {doctor.user.emailVerified && (
                                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                        Email Verified
                                    </span>
                                )}
                            </div>

                            {/* Joined Date */}
                            <p className="text-xs text-gray-500">
                                Joined {new Date(doctor.user.createdAt).toLocaleDateString()}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {doctors.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No Doctors Found
                        </h3>
                        <p className="text-gray-600">
                            There are no doctors in the system yet
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
