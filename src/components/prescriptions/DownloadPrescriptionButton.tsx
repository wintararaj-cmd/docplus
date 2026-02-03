'use client';

import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useState } from 'react';
import { format } from 'date-fns';

interface PrescriptionData {
    id: string;
    doctor: {
        firstName: string;
        lastName: string;
        specialization: string;
        licenseNumber: string;
    };
    patient: {
        firstName: string;
        lastName: string;
        dateOfBirth: string | Date;
        gender: string;
    };
    diagnosis: string;
    medications: any[]; // JSON
    notes?: string;
    prescriptionDate: string | Date;
}

interface DownloadPrescriptionButtonProps {
    prescription: PrescriptionData;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function DownloadPrescriptionButton({
    prescription,
    variant = 'outline',
    size = 'default'
}: DownloadPrescriptionButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePDF = async () => {
        setIsGenerating(true);
        try {
            const doc = new jsPDF();

            // Header
            doc.setFontSize(22);
            doc.setTextColor(41, 75, 230); // Blue
            doc.text('MEDICARE CLINIC', 105, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text('123 Health Avenue, Medical District', 105, 28, { align: 'center' });
            doc.text('Phone: (555) 123-4567 | Email: support@medicare.com', 105, 33, { align: 'center' });

            doc.setDrawColor(200);
            doc.line(20, 40, 190, 40);

            // Doctor Details
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text(`Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName}`, 20, 50);
            doc.setFontSize(10);
            doc.setTextColor(80);
            doc.text(prescription.doctor.specialization.toUpperCase(), 20, 55);
            doc.text(`Lic. No: ${prescription.doctor.licenseNumber}`, 20, 60);

            // Date
            doc.setFontSize(10);
            doc.setTextColor(0);
            doc.text(`Date: ${format(new Date(prescription.prescriptionDate), 'dd MMM yyyy')}`, 150, 50);
            doc.text(`ID: #${prescription.id.slice(-6).toUpperCase()}`, 150, 55);

            // Patient Details
            doc.setDrawColor(240);
            doc.setFillColor(248, 250, 252);
            doc.rect(20, 70, 170, 25, 'F');

            doc.setFontSize(11);
            doc.text('Patient Details:', 25, 80);
            doc.setFontSize(10);
            doc.text(`${prescription.patient.firstName} ${prescription.patient.lastName}`, 25, 88);

            // Calculate Age
            const dob = new Date(prescription.patient.dateOfBirth);
            const age = new Date().getFullYear() - dob.getFullYear();
            doc.text(`Age: ${age} | Gender: ${prescription.patient.gender}`, 100, 88);

            // Diagnosis
            doc.setFontSize(12);
            doc.text('Diagnosis', 20, 110);
            doc.setFontSize(10);
            doc.text(prescription.diagnosis, 20, 118);

            // Medications
            doc.setFontSize(12);
            doc.text('Rx / Medications', 20, 135);

            let y = 145;

            prescription.medications.forEach((med, index) => {
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.text(`${index + 1}. ${med.name} ${med.strength || ''}`, 25, y);

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.text(`Dosage: ${med.dosage} | Frequency: ${med.frequency}`, 35, y + 6);
                doc.text(`Duration: ${med.duration}`, 35, y + 12);
                if (med.instructions) {
                    doc.setFont('helvetica', 'italic');
                    doc.setTextColor(100);
                    doc.text(`Note: ${med.instructions}`, 35, y + 17);
                    doc.setTextColor(0);
                    doc.setFont('helvetica', 'normal');
                    y += 25;
                } else {
                    y += 18;
                }
            });

            // Notes
            if (prescription.notes) {
                y += 10;
                doc.setFontSize(11);
                doc.text('Additional Notes', 20, y);
                doc.setFontSize(10);
                doc.text(prescription.notes, 20, y + 8);
            }

            // Footer / Signature
            doc.setDrawColor(200);
            doc.line(20, 250, 190, 250);

            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text('This is a digitally generated prescription.', 105, 260, { align: 'center' });
            doc.text('Valid without signature if verified online.', 105, 265, { align: 'center' });

            // Save
            doc.save(`Prescription_${prescription.patient.firstName}_${format(new Date(prescription.prescriptionDate), 'yyyyMMdd')}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={generatePDF}
            disabled={isGenerating}
        >
            {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
                <FileDown className="h-4 w-4 mr-2" />
            )}
            Download PDF
        </Button>
    );
}
