import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
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

        // Return the schedule from doctor's data
        // For now, we'll store it as JSON in the database
        // You might want to create a separate Schedule table for more complex scenarios
        return NextResponse.json({
            schedule: doctor.schedule || [],
        });
    } catch (error) {
        console.error("Error fetching schedule:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

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

        const { schedule } = await request.json();

        // Validate schedule data
        if (!Array.isArray(schedule)) {
            return NextResponse.json(
                { message: "Invalid schedule format" },
                { status: 400 }
            );
        }

        const DAY_MAPPING: Record<string, number> = {
            "SUNDAY": 0,
            "MONDAY": 1,
            "TUESDAY": 2,
            "WEDNESDAY": 3,
            "THURSDAY": 4,
            "FRIDAY": 5,
            "SATURDAY": 6,
        };

        // Use transaction to ensure both updates succeed or fail together
        const updatedDoctor = await prisma.$transaction(async (tx) => {
            // 1. Update the JSON schedule field on Doctor model
            const updatedDoc = await tx.doctor.update({
                where: { id: doctor.id },
                data: {
                    schedule: schedule,
                },
            });

            // 2. Clear existing availability records
            await tx.doctorAvailability.deleteMany({
                where: { doctorId: doctor.id },
            });

            // 3. Create new availability records from the schedule
            const availabilityData = [];

            for (const daySchedule of schedule) {
                if (daySchedule.isAvailable && daySchedule.slots && Array.isArray(daySchedule.slots)) {
                    const dayOfWeek = DAY_MAPPING[daySchedule.day.toUpperCase()];

                    if (dayOfWeek !== undefined) {
                        for (const slot of daySchedule.slots) {
                            if (slot.startTime && slot.endTime) {
                                availabilityData.push({
                                    doctorId: doctor.id,
                                    dayOfWeek: dayOfWeek,
                                    startTime: slot.startTime,
                                    endTime: slot.endTime,
                                    slotDuration: 30, // Default to 30 mins
                                    isActive: true
                                });
                            }
                        }
                    }
                }
            }

            if (availabilityData.length > 0) {
                await tx.doctorAvailability.createMany({
                    data: availabilityData,
                });
            }

            return updatedDoc;
        });

        return NextResponse.json({
            message: "Schedule updated successfully",
            schedule: updatedDoctor.schedule,
        });
    } catch (error) {
        console.error("Error updating schedule:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
