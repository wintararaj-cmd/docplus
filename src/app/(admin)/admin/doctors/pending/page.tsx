"use client";

import { useState, useEffect } from "react";
import {
    UserCheck,
    UserX,
    Mail,
    Phone,
    Award,
    Briefcase,
    DollarSign,
    MapPin,
    CheckCircle,
    XCircle,
    Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

type PendingDoctor = {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    specialization: string;
    qualification: string;
    experience: number;
    licenseNumber: string;
    consultationFee: number;
    about: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    user: {
        email: string;
        phone: string | null;
        createdAt: string;
    };
};

export default function PendingDoctors() {
    const [doctors, setDoctors] = useState<PendingDoctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        fetchPendingDoctors();
    }, []);

    const fetchPendingDoctors = async () => {
        try {
            const response = await fetch("/api/admin/doctors/pending");
            if (response.ok) {
                const data = await response.json();
                setDoctors(data.doctors || []);
            } else {
                toast.error("Failed to load pending doctors");
            }
        } catch (error) {
            console.error("Error fetching pending doctors:", error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (doctorId: string, userId: string) => {
        setProcessing(doctorId);
        try {
            const response = await fetch("/api/admin/doctors/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ doctorId, userId, action: "approve" }),
            });

            if (response.ok) {
                toast.success("Doctor verified successfully!");
                // Remove from list
                setDoctors(doctors.filter((d) => d.id !== doctorId));
            } else {
                const error = await response.json();
                toast.error(error.message || "Failed to verify doctor");
            }
        } catch (error) {
            console.error("Error verifying doctor:", error);
            toast.error("An error occurred");
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (doctorId: string, userId: string) => {
        if (!confirm("Are you sure you want to reject this doctor? This will delete their account.")) {
            return;
        }

        setProcessing(doctorId);
        try {
            const response = await fetch("/api/admin/doctors/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ doctorId, userId, action: "reject" }),
            });

            if (response.ok) {
                toast.success("Doctor application rejected");
                // Remove from list
                setDoctors(doctors.filter((d) => d.id !== doctorId));
            } else {
                const error = await response.json();
                toast.error(error.message || "Failed to reject doctor");
            }
        } catch (error) {
            console.error("Error rejecting doctor:", error);
            toast.error("An error occurred");
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Pending Doctor Verification
                </h1>
                <p className="text-gray-600 mt-1">
                    Review and verify doctor credentials before activating their accounts
                </p>
            </div>

            {/* Doctors List */}
            {doctors.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No Pending Verifications
                        </h3>
                        <p className="text-gray-600">
                            All doctor applications have been processed
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {doctors.map((doctor) => (
                        <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-2xl">
                                            Dr. {doctor.firstName} {doctor.lastName}
                                        </CardTitle>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Applied on {new Date(doctor.user.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="bg-orange-100 px-3 py-1 rounded-full">
                                        <span className="text-xs font-semibold text-orange-700">
                                            PENDING
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {/* Contact Information */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                        Contact Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2 text-sm">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-700">{doctor.user.email}</span>
                                        </div>
                                        {doctor.user.phone && (
                                            <div className="flex items-center space-x-2 text-sm">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-700">{doctor.user.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Professional Information */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                        Professional Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <Briefcase className="h-4 w-4 text-gray-400" />
                                                <span className="text-xs font-medium text-gray-600">
                                                    Specialization
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {doctor.specialization}
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <Award className="h-4 w-4 text-gray-400" />
                                                <span className="text-xs font-medium text-gray-600">
                                                    Qualification
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {doctor.qualification}
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <Briefcase className="h-4 w-4 text-gray-400" />
                                                <span className="text-xs font-medium text-gray-600">
                                                    Experience
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {doctor.experience} years
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <Award className="h-4 w-4 text-gray-400" />
                                                <span className="text-xs font-medium text-gray-600">
                                                    License Number
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {doctor.licenseNumber}
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <DollarSign className="h-4 w-4 text-gray-400" />
                                                <span className="text-xs font-medium text-gray-600">
                                                    Consultation Fee
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                ₹{doctor.consultationFee}
                                            </p>
                                        </div>

                                        {doctor.city && (
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                    <span className="text-xs font-medium text-gray-600">
                                                        Location
                                                    </span>
                                                </div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {doctor.city}, {doctor.state}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* About */}
                                {doctor.about && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 mb-2">
                                            About
                                        </h3>
                                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                            {doctor.about}
                                        </p>
                                    </div>
                                )}

                                {/* Address */}
                                {doctor.address && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 mb-2">
                                            Clinic Address
                                        </h3>
                                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                            {doctor.address}
                                            {doctor.city && `, ${doctor.city}`}
                                            {doctor.state && `, ${doctor.state}`}
                                        </p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                                    <Button
                                        onClick={() => handleReject(doctor.id, doctor.userId)}
                                        disabled={processing === doctor.id}
                                        variant="outline"
                                        className="border-red-600 text-red-600 hover:bg-red-50"
                                    >
                                        {processing === doctor.id ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <XCircle className="h-4 w-4 mr-2" />
                                        )}
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={() => handleVerify(doctor.id, doctor.userId)}
                                        disabled={processing === doctor.id}
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                    >
                                        {processing === doctor.id ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                        )}
                                        Verify & Activate
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
