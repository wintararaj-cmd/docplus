import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import {
    FileText,
    User,
    Calendar,
    Stethoscope,
    Pill,
    Download,
    Printer
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function PrescriptionDetail({
    params,
}: {
    params: { id: string };
}) {
    const session = await getServerSession(authOptions);

    const prescription = await prisma.prescription.findUnique({
        where: { id: params.id },
        include: {
            patient: {
                include: {
                    user: true,
                },
            },
            doctor: {
                include: {
                    user: true,
                },
            },
            appointment: true,
        },
    });

    if (!prescription) {
        notFound();
    }

    // Check authorization
    if (session?.user.role === "DOCTOR") {
        const doctor = await prisma.doctor.findUnique({
            where: { userId: session.user.id },
        });
        if (doctor?.id !== prescription.doctorId) {
            notFound();
        }
    } else if (session?.user.role === "PATIENT") {
        const patient = await prisma.patient.findUnique({
            where: { userId: session.user.id },
        });
        if (patient?.id !== prescription.patientId) {
            notFound();
        }
    }

    // Prepare medications
    const medications = Array.isArray(prescription.medications)
        ? prescription.medications
        : [];

    // Calculate age
    let age = "N/A";
    if (prescription.patient.dateOfBirth) {
        const today = new Date();
        const dob = new Date(prescription.patient.dateOfBirth);
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
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Prescription Details</h1>
                    <p className="text-gray-600 mt-1">
                        Created on {new Date(prescription.createdAt).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                    </Button>
                    <Button variant="outline">
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                    </Button>
                </div>
            </div>

            {/* Prescription Header Card */}
            <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Patient Info */}
                        <div className="flex items-start space-x-4">
                            <div className="bg-blue-100 p-3 rounded-xl">
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Patient</p>
                                <p className="text-lg font-semibold text-gray-900 mt-1">
                                    {prescription.patient.firstName} {prescription.patient.lastName}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {prescription.patient.user.email}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Age: {age} years
                                </p>
                                {prescription.patient.bloodGroup && (
                                    <p className="text-sm text-gray-600">
                                        Blood Group: {prescription.patient.bloodGroup}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Doctor Info */}
                        <div className="flex items-start space-x-4">
                            <div className="bg-emerald-100 p-3 rounded-xl">
                                <Stethoscope className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Prescribed by</p>
                                <p className="text-lg font-semibold text-gray-900 mt-1">
                                    Dr. {prescription.doctor.firstName} {prescription.doctor.lastName}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {prescription.doctor.specialization}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {prescription.doctor.experience} years of experience
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Diagnosis */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-emerald-600" />
                        <span>Diagnosis</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-900 whitespace-pre-wrap">
                        {prescription.diagnosis}
                    </p>
                </CardContent>
            </Card>

            {/* Medications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Pill className="h-5 w-5 text-emerald-600" />
                        <span>Prescribed Medications</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {medications.length === 0 ? (
                        <p className="text-gray-500 italic">No medications prescribed</p>
                    ) : (
                        <div className="space-y-4">
                            {medications.map((medication: any, index: number) => (
                                <div
                                    key={index}
                                    className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {index + 1}. {medication.name}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        {medication.dosage && (
                                            <div>
                                                <p className="font-medium text-gray-700">Dosage</p>
                                                <p className="text-gray-600">{medication.dosage}</p>
                                            </div>
                                        )}
                                        {medication.frequency && (
                                            <div>
                                                <p className="font-medium text-gray-700">Frequency</p>
                                                <p className="text-gray-600">{medication.frequency}</p>
                                            </div>
                                        )}
                                        {medication.duration && (
                                            <div>
                                                <p className="font-medium text-gray-700">Duration</p>
                                                <p className="text-gray-600">{medication.duration}</p>
                                            </div>
                                        )}
                                    </div>

                                    {medication.instructions && (
                                        <div className="mt-3 pt-3 border-t border-gray-300">
                                            <p className="font-medium text-gray-700 text-sm">
                                                Instructions
                                            </p>
                                            <p className="text-gray-600 text-sm mt-1">
                                                {medication.instructions}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Additional Notes */}
            {prescription.notes && (
                <Card>
                    <CardHeader>
                        <CardTitle>Additional Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-900 whitespace-pre-wrap">
                            {prescription.notes}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Prescription Footer */}
            <Card className="bg-gray-50">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                                Prescription ID: <span className="font-mono">{prescription.id}</span>
                            </span>
                        </div>
                        <div>
                            <span>
                                Issued on:{" "}
                                {new Date(prescription.createdAt).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
