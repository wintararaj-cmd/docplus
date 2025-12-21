import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

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
            return NextResponse.json(
                { message: "Prescription not found" },
                { status: 404 }
            );
        }

        // Check authorization
        if (session.user.role === "DOCTOR") {
            const doctor = await prisma.doctor.findUnique({
                where: { userId: session.user.id },
            });

            if (doctor?.id !== prescription.doctorId) {
                return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
            }
        } else if (session.user.role === "PATIENT") {
            const patient = await prisma.patient.findUnique({
                where: { userId: session.user.id },
            });

            if (patient?.id !== prescription.patientId) {
                return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
            }
        } else {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        return NextResponse.json(prescription);
    } catch (error) {
        console.error("Error fetching prescription:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
