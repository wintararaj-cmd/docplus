import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
    Users,
    User,
    Mail,
    Phone,
    Calendar,
    FileText,
    Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function DoctorPatients() {
    const session = await getServerSession(authOptions);

    const doctor = await prisma.doctor.findUnique({
        where: { userId: session?.user.id },
        include: {
            appointments: {
                include: {
                    patient: {
                        include: {
                            user: true,
                            medicalRecords: true,
                        },
                    },
                },
            },
        },
    });

    if (!doctor) {
        return <div>Doctor profile not found</div>;
    }

    // Get unique patients
    const patientsMap = new Map();
    doctor.appointments.forEach((appointment) => {
        const patientId = appointment.patient.id;
        if (!patientsMap.has(patientId)) {
            // Calculate age
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

            patientsMap.set(patientId, {
                ...appointment.patient,
                age,
                appointmentCount: 1,
                lastAppointment: appointment.appointmentDate,
            });
        } else {
            const existing = patientsMap.get(patientId);
            existing.appointmentCount++;
            if (new Date(appointment.appointmentDate) > new Date(existing.lastAppointment)) {
                existing.lastAppointment = appointment.appointmentDate;
            }
        }
    });

    const patients = Array.from(patientsMap.values());

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
                    <p className="text-gray-600 mt-1">
                        View and manage your patient records
                    </p>
                </div>
                <div className="bg-gradient-to-r from-emerald-100 to-teal-100 px-6 py-3 rounded-xl">
                    <p className="text-sm text-emerald-700 font-medium">Total Patients</p>
                    <p className="text-3xl font-bold text-emerald-900">{patients.length}</p>
                </div>
            </div>

            {/* Search Bar */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search patients by name or email..."
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Patients Grid */}
            {patients.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No patients yet
                        </h3>
                        <p className="text-gray-600">
                            Patients who book appointments with you will appear here.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {patients.map((patient) => (
                        <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-3 rounded-xl">
                                            <User className="h-6 w-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">
                                                {patient.firstName} {patient.lastName}
                                            </CardTitle>
                                            <p className="text-sm text-gray-500">
                                                Age: {patient.age || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <Mail className="h-4 w-4" />
                                        <span className="truncate">{patient.user.email}</span>
                                    </div>
                                    {patient.phone && (
                                        <div className="flex items-center space-x-2 text-gray-600">
                                            <Phone className="h-4 w-4" />
                                            <span>{patient.phone}</span>
                                        </div>
                                    )}
                                    {patient.bloodGroup && (
                                        <div className="flex items-center space-x-2 text-gray-600">
                                            <FileText className="h-4 w-4" />
                                            <span>Blood Group: {patient.bloodGroup}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-gray-200">
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="bg-blue-50 p-2 rounded-lg">
                                            <p className="text-xs text-blue-600 font-medium">
                                                Appointments
                                            </p>
                                            <p className="text-lg font-bold text-blue-900">
                                                {patient.appointmentCount}
                                            </p>
                                        </div>
                                        <div className="bg-purple-50 p-2 rounded-lg">
                                            <p className="text-xs text-purple-600 font-medium">
                                                Records
                                            </p>
                                            <p className="text-lg font-bold text-purple-900">
                                                {patient.medicalRecords.length}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-xs text-gray-500">
                                    <Calendar className="h-3 w-3 inline mr-1" />
                                    Last visit:{" "}
                                    {new Date(patient.lastAppointment).toLocaleDateString()}
                                </div>

                                <Link href={`/doctor/patients/${patient.id}`}>
                                    <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                                        View Profile
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
