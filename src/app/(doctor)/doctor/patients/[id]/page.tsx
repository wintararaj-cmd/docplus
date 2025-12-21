import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
    User,
    Mail,
    Phone,
    Calendar,
    FileText,
    Activity,
    Droplet,
    MapPin,
    Clock,
    Download,
    Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function PatientProfile({
    params,
}: {
    params: { id: string };
}) {
    const session = await getServerSession(authOptions);

    const doctor = await prisma.doctor.findUnique({
        where: { userId: session?.user.id },
    });

    if (!doctor) {
        return <div>Doctor profile not found</div>;
    }

    const patient = await prisma.patient.findUnique({
        where: { id: params.id },
        include: {
            user: true,
            appointments: {
                where: {
                    doctorId: doctor.id,
                },
                orderBy: {
                    appointmentDate: "desc",
                },
            },
            medicalRecords: {
                orderBy: {
                    createdAt: "desc",
                },
            },
            prescriptions: {
                where: {
                    doctorId: doctor.id,
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    });

    if (!patient) {
        notFound();
    }

    // Calculate age
    let age = "N/A";
    if (patient.dateOfBirth) {
        const today = new Date();
        const dob = new Date(patient.dateOfBirth);
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
                <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-6 rounded-2xl">
                        <User className="h-12 w-12 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {patient.firstName} {patient.lastName}
                        </h1>
                        <div className="flex items-center space-x-4 mt-2 text-gray-600">
                            <div className="flex items-center space-x-1">
                                <Mail className="h-4 w-4" />
                                <span>{patient.user.email}</span>
                            </div>
                            {patient.phone && (
                                <div className="flex items-center space-x-1">
                                    <Phone className="h-4 w-4" />
                                    <span>{patient.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <Link href={`/doctor/prescriptions/create?patientId=${patient.id}`}>
                    <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                        <FileText className="h-4 w-4 mr-2" />
                        Create Prescription
                    </Button>
                </Link>
            </div>

            {/* Patient Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm text-gray-600">Age</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {age}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-3">
                            <Droplet className="h-5 w-5 text-red-600" />
                            <div>
                                <p className="text-sm text-gray-600">Blood Group</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {patient.bloodGroup || "N/A"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-3">
                            <Activity className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-600">Appointments</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {patient.appointments.length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-purple-600" />
                            <div>
                                <p className="text-sm text-gray-600">Records</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {patient.medicalRecords.length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Info */}
            {(patient.address || patient.emergencyContact) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {patient.address && (
                            <div className="flex items-start space-x-2">
                                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Address</p>
                                    <p className="text-gray-600">{patient.address}</p>
                                </div>
                            </div>
                        )}
                        {patient.emergencyContact && (
                            <div className="flex items-start space-x-2">
                                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Emergency Contact
                                    </p>
                                    <p className="text-gray-600">{patient.emergencyContact}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Tabs */}
            <Tabs defaultValue="appointments" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="appointments">
                        Appointments ({patient.appointments.length})
                    </TabsTrigger>
                    <TabsTrigger value="records">
                        Medical Records ({patient.medicalRecords.length})
                    </TabsTrigger>
                    <TabsTrigger value="prescriptions">
                        Prescriptions ({patient.prescriptions.length})
                    </TabsTrigger>
                </TabsList>

                {/* Appointments Tab */}
                <TabsContent value="appointments" className="space-y-4">
                    {patient.appointments.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No appointments found</p>
                            </CardContent>
                        </Card>
                    ) : (
                        patient.appointments.map((appointment) => (
                            <Card key={appointment.id}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <span className="font-medium">
                                                        {new Date(appointment.appointmentDate).toLocaleDateString(
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
                                                <div className="flex items-center space-x-2">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <span className="font-medium">
                                                        {appointment.startTime}
                                                    </span>
                                                </div>
                                            </div>
                                            {appointment.reason && (
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Reason:</span>{" "}
                                                    {appointment.reason}
                                                </p>
                                            )}
                                            {appointment.notes && (
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Notes:</span>{" "}
                                                    {appointment.notes}
                                                </p>
                                            )}
                                        </div>
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
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                {/* Medical Records Tab */}
                <TabsContent value="records" className="space-y-4">
                    {patient.medicalRecords.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No medical records found</p>
                            </CardContent>
                        </Card>
                    ) : (
                        patient.medicalRecords.map((record) => (
                            <Card key={record.id}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            <div className="bg-purple-100 p-3 rounded-lg">
                                                <FileText className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {record.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {record.description}
                                                </p>
                                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                    <span>Type: {record.recordType}</span>
                                                    <span>
                                                        Uploaded:{" "}
                                                        {new Date(record.createdAt).toLocaleDateString()}
                                                    </span>
                                                    {record.fileSize && (
                                                        <span>
                                                            Size: {(record.fileSize / 1024).toFixed(2)} KB
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            {record.fileUrl && (
                                                <>
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        <Download className="h-4 w-4 mr-1" />
                                                        Download
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                {/* Prescriptions Tab */}
                <TabsContent value="prescriptions" className="space-y-4">
                    {patient.prescriptions.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No prescriptions found</p>
                                <Link
                                    href={`/doctor/prescriptions/create?patientId=${patient.id}`}
                                >
                                    <Button className="mt-4 bg-gradient-to-r from-emerald-600 to-teal-600">
                                        Create First Prescription
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        patient.prescriptions.map((prescription) => (
                            <Card key={prescription.id}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium">
                                                    {new Date(prescription.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {prescription.diagnosis && (
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Diagnosis:</span>{" "}
                                                    {prescription.diagnosis}
                                                </p>
                                            )}
                                            {prescription.notes && (
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Notes:</span>{" "}
                                                    {prescription.notes}
                                                </p>
                                            )}
                                        </div>
                                        <Link href={`/doctor/prescriptions/${prescription.id}`}>
                                            <Button size="sm" variant="outline">
                                                View Details
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
