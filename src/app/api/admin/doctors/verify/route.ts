import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();
        const { doctorId, userId, action } = body;

        if (!doctorId || !userId || !action) {
            return NextResponse.json(
                { message: "Doctor ID, User ID, and action are required" },
                { status: 400 }
            );
        }

        if (action === "approve") {
            // Verify and activate the doctor
            await prisma.$transaction([
                // Update doctor record
                prisma.doctor.update({
                    where: { id: doctorId },
                    data: {
                        licenseVerified: true,
                        isAvailable: true,
                    },
                }),
                // Activate user account
                prisma.user.update({
                    where: { id: userId },
                    data: {
                        isActive: true,
                        emailVerified: true,
                    },
                }),
            ]);

            return NextResponse.json({
                message: "Doctor verified and activated successfully",
            });
        } else if (action === "reject") {
            // Delete the doctor and user account
            await prisma.user.delete({
                where: { id: userId },
            });

            return NextResponse.json({
                message: "Doctor application rejected and account deleted",
            });
        } else {
            return NextResponse.json(
                { message: "Invalid action. Must be 'approve' or 'reject'" },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Error verifying doctor:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
