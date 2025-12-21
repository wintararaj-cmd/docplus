import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
    FileText,
    Calendar,
    User,
    Plus,
    Eye,
    Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DoctorPrescriptions() {
    const session = await getServerSession(authOptions);

    const doctor = await prisma.doctor.findUnique({
        where: { userId: session?.user.id },
        include: {
            prescriptions: {
                include: {
                    patient: {
                        include: {
                            user: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    });

    if (!doctor) {
        return <div>Doctor profile not found</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
                    <p className="text-gray-600 mt-1">
                        View and manage patient prescriptions
                    </p>
                </div>
                <Link href="/doctor/prescriptions/create">
                    <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                        <Plus className="h-4 w-4 mr-2" />
                        New Prescription
                    </Button>
                </Link>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Total Prescriptions
                                </p>
                                <p className="text-3xl font-bold text-emerald-600 mt-2">
                                    {doctor.prescriptions.length}
                                </p>
                            </div>
                            <div className="bg-emerald-100 p-3 rounded-xl">
                                <FileText className="h-6 w-6 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">This Month</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">
                                    {
                                        doctor.prescriptions.filter((p) => {
                                            const date = new Date(p.createdAt);
                                            const now = new Date();
                                            return (
                                                date.getMonth() === now.getMonth() &&
                                                date.getFullYear() === now.getFullYear()
                                            );
                                        }).length
                                    }
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
                                <p className="text-sm font-medium text-gray-600">
                                    Unique Patients
                                </p>
                                <p className="text-3xl font-bold text-purple-600 mt-2">
                                    {new Set(doctor.prescriptions.map((p) => p.patientId)).size}
                                </p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-xl">
                                <User className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Prescriptions List */}
            {doctor.prescriptions.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No prescriptions yet
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Create your first prescription to get started
                        </p>
                        <Link href="/doctor/prescriptions/create">
                            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Prescription
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {doctor.prescriptions.map((prescription) => (
                        <Card
                            key={prescription.id}
                            className="hover:shadow-lg transition-shadow"
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4 flex-1">
                                        {/* Icon */}
                                        <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-4 rounded-xl">
                                            <FileText className="h-6 w-6 text-emerald-600" />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <div className="flex items-center space-x-3">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {prescription.patient.firstName} {prescription.patient.lastName}
                                                    </h3>
                                                    <span className="text-sm text-gray-500">
                                                        {(() => {
                                                            if (prescription.patient.dateOfBirth) {
                                                                const today = new Date();
                                                                const dob = new Date(prescription.patient.dateOfBirth);
                                                                let age = today.getFullYear() - dob.getFullYear();
                                                                const m = today.getMonth() - dob.getMonth();
                                                                if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                                                                    age--;
                                                                }
                                                                return `${age} years`;
                                                            }
                                                            return "";
                                                        })()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {prescription.patient.user.email}
                                                </p>
                                            </div>

                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    Created on{" "}
                                                    {new Date(prescription.createdAt).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            weekday: "long",
                                                            month: "long",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </span>
                                            </div>

                                            {prescription.diagnosis && (
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                    <p className="text-sm">
                                                        <span className="font-medium text-blue-900">
                                                            Diagnosis:{" "}
                                                        </span>
                                                        <span className="text-blue-800">
                                                            {prescription.diagnosis}
                                                        </span>
                                                    </p>
                                                </div>
                                            )}

                                            {prescription.medications &&
                                                Array.isArray(prescription.medications) &&
                                                prescription.medications.length > 0 && (
                                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                        <span className="font-medium">
                                                            {prescription.medications.length} medication(s)
                                                            prescribed
                                                        </span>
                                                    </div>
                                                )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col space-y-2">
                                        <Link href={`/doctor/prescriptions/${prescription.id}`}>
                                            <Button size="sm" variant="outline">
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                        </Link>
                                        <Button size="sm" variant="outline">
                                            <Download className="h-4 w-4 mr-1" />
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
