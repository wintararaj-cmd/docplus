import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "DOCTOR") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const doctor = await prisma.doctor.findUnique({
            where: { userId: session.user.id },
            include: {
                appointments: {
                    include: {
                        patient: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
            },
        });

        if (!doctor) {
            return new NextResponse("Doctor not found", { status: 404 });
        }

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
                    id: appointment.patient.id,
                    firstName: appointment.patient.firstName,
                    lastName: appointment.patient.lastName,
                    email: appointment.patient.user.email,
                    age,
                    bloodGroup: appointment.patient.bloodGroup,
                });
            }
        });

        const patients = Array.from(patientsMap.values());

        return NextResponse.json(patients);
    } catch (error) {
        console.error("Error fetching patients:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
