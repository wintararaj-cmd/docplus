import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "DOCTOR") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const doctor = await prisma.doctor.findUnique({
            where: { userId: session.user.id },
        });

        if (!doctor) {
            return NextResponse.json(
                { message: "Doctor profile not found" },
                { status: 404 }
            );
        }

        const { patientId, appointmentId, diagnosis, medications, notes } =
            await request.json();

        // Validate required fields
        if (!patientId || !diagnosis || !medications || medications.length === 0) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Verify patient exists
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
        });

        if (!patient) {
            return NextResponse.json(
                { message: "Patient not found" },
                { status: 404 }
            );
        }

        // Create prescription
        const prescription = await prisma.prescription.create({
            data: {
                doctorId: doctor.id,
                patientId,
                appointmentId: appointmentId || null,
                diagnosis,
                medications,
                notes: notes || null,
            },
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
            },
        });

        return NextResponse.json(prescription, { status: 201 });
    } catch (error) {
        console.error("Error creating prescription:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get("patientId");

        let prescriptions;

        if (session.user.role === "DOCTOR") {
            const doctor = await prisma.doctor.findUnique({
                where: { userId: session.user.id },
            });

            if (!doctor) {
                return NextResponse.json(
                    { message: "Doctor profile not found" },
                    { status: 404 }
                );
            }

            prescriptions = await prisma.prescription.findMany({
                where: {
                    doctorId: doctor.id,
                    ...(patientId && { patientId }),
                },
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
            });
        } else if (session.user.role === "PATIENT") {
            const patient = await prisma.patient.findUnique({
                where: { userId: session.user.id },
            });

            if (!patient) {
                return NextResponse.json(
                    { message: "Patient profile not found" },
                    { status: 404 }
                );
            }

            prescriptions = await prisma.prescription.findMany({
                where: {
                    patientId: patient.id,
                },
                include: {
                    doctor: {
                        include: {
                            user: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        } else {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.json(prescriptions);
    } catch (error) {
        console.error("Error fetching prescriptions:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
