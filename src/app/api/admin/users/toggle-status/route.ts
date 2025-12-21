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
        const { userId, isActive } = body;

        if (!userId || typeof isActive !== "boolean") {
            return NextResponse.json(
                { message: "User ID and status are required" },
                { status: 400 }
            );
        }

        // Don't allow deactivating admin users
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (user.role === "ADMIN" && !isActive) {
            return NextResponse.json(
                { message: "Cannot deactivate admin users" },
                { status: 400 }
            );
        }

        // Update user status
        await prisma.user.update({
            where: { id: userId },
            data: { isActive },
        });

        return NextResponse.json({
            message: `User ${isActive ? "activated" : "deactivated"} successfully`,
        });
    } catch (error) {
        console.error("Error toggling user status:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
