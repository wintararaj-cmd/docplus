"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    FileText,
    Plus,
    Trash2,
    Save,
    User,
    Calendar,
    Pill,
    Search
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Medication = {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
};

export default function CreatePrescription() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const patientId = searchParams.get("patientId");
    const appointmentId = searchParams.get("appointmentId");

    const [loading, setLoading] = useState(false);
    const [patient, setPatient] = useState<any>(null);
    const [availablePatients, setAvailablePatients] = useState<any[]>([]);
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [diagnosis, setDiagnosis] = useState("");
    const [notes, setNotes] = useState("");
    const [medications, setMedications] = useState<Medication[]>([
        {
            name: "",
            dosage: "",
            frequency: "",
            duration: "",
            instructions: "",
        },
    ]);

    useEffect(() => {
        if (patientId) {
            fetchPatient(patientId);
        } else if (appointmentId) {
            fetchAppointment(appointmentId);
        } else {
            fetchMyPatients();
        }
    }, [patientId, appointmentId]);

    const fetchMyPatients = async () => {
        setLoadingPatients(true);
        try {
            const response = await fetch("/api/doctor/patients");
            if (response.ok) {
                const data = await response.json();
                setAvailablePatients(data);
            }
        } catch (error) {
            console.error("Error fetching patients:", error);
            toast.error("Failed to load patients list");
        } finally {
            setLoadingPatients(false);
        }
    };

    const fetchPatient = async (id: string) => {
        try {
            const response = await fetch(`/api/patients/${id}`);
            if (response.ok) {
                const data = await response.json();
                setPatient(data);
            }
        } catch (error) {
            console.error("Error fetching patient:", error);
            toast.error("Failed to load patient information");
        }
    };

    const fetchAppointment = async (id: string) => {
        try {
            const response = await fetch(`/api/appointments/${id}`);
            if (response.ok) {
                const data = await response.json();
                setPatient(data.patient);
            }
        } catch (error) {
            console.error("Error fetching appointment:", error);
            toast.error("Failed to load appointment information");
        }
    };

    const addMedication = () => {
        setMedications([
            ...medications,
            {
                name: "",
                dosage: "",
                frequency: "",
                duration: "",
                instructions: "",
            },
        ]);
    };

    const removeMedication = (index: number) => {
        const newMedications = medications.filter((_, i) => i !== index);
        setMedications(newMedications);
    };

    const updateMedication = (
        index: number,
        field: keyof Medication,
        value: string
    ) => {
        const newMedications = [...medications];
        newMedications[index][field] = value;
        setMedications(newMedications);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!patient) {
            toast.error("Patient information not loaded");
            return;
        }

        if (!diagnosis.trim()) {
            toast.error("Please enter a diagnosis");
            return;
        }

        const validMedications = medications.filter((med) => med.name.trim());
        if (validMedications.length === 0) {
            toast.error("Please add at least one medication");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/prescriptions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId: patient.id,
                    appointmentId: appointmentId || undefined,
                    diagnosis,
                    medications: validMedications,
                    notes,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                toast.success("Prescription created successfully!");
                router.push(`/doctor/prescriptions/${data.id}`);
            } else {
                const error = await response.json();
                toast.error(error.message || "Failed to create prescription");
            }
        } catch (error) {
            console.error("Error creating prescription:", error);
            toast.error("Failed to create prescription");
        } finally {
            setLoading(false);
        }
    };

    if (!patient) {
        if (loading || loadingPatients) {
            return (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
            );
        }

        return (
            <div className="max-w-xl mx-auto py-12">
                <Card>
                    <CardHeader>
                        <CardTitle>Select Patient</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-600">
                            Please select a patient to create a prescription for.
                        </p>
                        <Select
                            onValueChange={(value) => {
                                const selected = availablePatients.find((p) => p.id === value);
                                if (selected) {
                                    // Construct patient object compatible with the form
                                    setPatient({
                                        ...selected,
                                        user: { email: selected.email }
                                    });
                                }
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a patient..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availablePatients.length === 0 ? (
                                    <div className="p-2 text-sm text-gray-500 text-center">No patients found</div>
                                ) : (
                                    availablePatients.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.firstName} {p.lastName} ({p.email})
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>

                        <div className="flex justify-end pt-4">
                            <Button variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Create Prescription</h1>
                <p className="text-gray-600 mt-1">
                    Create a new prescription for your patient
                </p>
            </div>

            {/* Patient Info */}
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-xl">
                            <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">
                                {patient.firstName} {patient.lastName}
                            </h3>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                <span>Age: {patient.age || "N/A"}</span>
                                {patient.bloodGroup && (
                                    <span>Blood Group: {patient.bloodGroup}</span>
                                )}
                                <span>{patient.user.email}</span>
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
                    <Textarea
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder="Enter diagnosis..."
                        className="min-h-[100px]"
                        required
                    />
                </CardContent>
            </Card>

            {/* Medications */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                            <Pill className="h-5 w-5 text-emerald-600" />
                            <span>Medications</span>
                        </CardTitle>
                        <Button
                            type="button"
                            onClick={addMedication}
                            size="sm"
                            variant="outline"
                            className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Medication
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {medications.map((medication, index) => (
                        <div
                            key={index}
                            className="p-4 bg-gray-50 rounded-lg space-y-4 relative"
                        >
                            {medications.length > 1 && (
                                <Button
                                    type="button"
                                    onClick={() => removeMedication(index)}
                                    size="sm"
                                    variant="ghost"
                                    className="absolute top-2 right-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor={`med-name-${index}`}>
                                        Medicine Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id={`med-name-${index}`}
                                        value={medication.name}
                                        onChange={(e) =>
                                            updateMedication(index, "name", e.target.value)
                                        }
                                        placeholder="e.g., Paracetamol"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor={`med-dosage-${index}`}>Dosage</Label>
                                    <Input
                                        id={`med-dosage-${index}`}
                                        value={medication.dosage}
                                        onChange={(e) =>
                                            updateMedication(index, "dosage", e.target.value)
                                        }
                                        placeholder="e.g., 500mg"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor={`med-frequency-${index}`}>Frequency</Label>
                                    <Input
                                        id={`med-frequency-${index}`}
                                        value={medication.frequency}
                                        onChange={(e) =>
                                            updateMedication(index, "frequency", e.target.value)
                                        }
                                        placeholder="e.g., 3 times a day"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor={`med-duration-${index}`}>Duration</Label>
                                    <Input
                                        id={`med-duration-${index}`}
                                        value={medication.duration}
                                        onChange={(e) =>
                                            updateMedication(index, "duration", e.target.value)
                                        }
                                        placeholder="e.g., 7 days"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor={`med-instructions-${index}`}>
                                    Instructions
                                </Label>
                                <Textarea
                                    id={`med-instructions-${index}`}
                                    value={medication.instructions}
                                    onChange={(e) =>
                                        updateMedication(index, "instructions", e.target.value)
                                    }
                                    placeholder="e.g., Take after meals"
                                    rows={2}
                                />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
                <CardHeader>
                    <CardTitle>Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any additional notes or recommendations..."
                        className="min-h-[100px]"
                    />
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Creating..." : "Create Prescription"}
                </Button>
            </div>
        </form>
    );
}
