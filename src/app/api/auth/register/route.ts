import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { generateVerificationToken, sendVerificationEmail } from "@/lib/email-auth";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, role, phone, ...profileData } = body;

        // Validate required fields
        if (!email || !password || !role) {
            return NextResponse.json(
                { message: "Email, password, and role are required" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "User with this email already exists" },
                { status: 400 }
            );
        }

        // Check if phone is provided and already exists
        if (phone) {
            const existingPhone = await prisma.user.findUnique({
                where: { phone },
            });

            if (existingPhone) {
                return NextResponse.json(
                    { message: "User with this phone number already exists" },
                    { status: 400 }
                );
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user and profile based on role
        if (role === "PATIENT") {
            const { firstName, lastName, dateOfBirth, gender, ...otherData } = profileData;

            // Validate patient required fields
            if (!firstName || !lastName || !dateOfBirth || !gender) {
                return NextResponse.json(
                    { message: "First name, last name, date of birth, and gender are required for patients" },
                    { status: 400 }
                );
            }

            // Create user and patient profile in a transaction
            const user = await prisma.user.create({
                data: {
                    email,
                    phone: phone || null,
                    password: hashedPassword,
                    role: "PATIENT",
                    emailVerified: false,
                    isActive: true,
                    patient: {
                        create: {
                            firstName,
                            lastName,
                            dateOfBirth: new Date(dateOfBirth),
                            gender,
                            bloodGroup: otherData.bloodGroup || null,
                            address: otherData.address || null,
                            city: otherData.city || null,
                            state: otherData.state || null,
                            zipCode: otherData.zipCode || null,
                            emergencyContact: otherData.emergencyContact || null,
                            emergencyPhone: otherData.emergencyPhone || null,
                        },
                    },
                },
                include: {
                    patient: true,
                },
            });

            return NextResponse.json(
                {
                    message: "Patient account created successfully",
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                    },
                },
                { status: 201 }
            );
        } else if (role === "DOCTOR") {
            const {
                firstName,
                lastName,
                specialization,
                qualification,
                experience,
                licenseNumber,
                consultationFee,
                ...otherData
            } = profileData;

            // Validate doctor required fields
            if (
                !firstName ||
                !lastName ||
                !specialization ||
                !qualification ||
                !experience ||
                !licenseNumber ||
                !consultationFee
            ) {
                return NextResponse.json(
                    {
                        message:
                            "First name, last name, specialization, qualification, experience, license number, and consultation fee are required for doctors",
                    },
                    { status: 400 }
                );
            }

            // Check if license number already exists
            const existingLicense = await prisma.doctor.findUnique({
                where: { licenseNumber },
            });

            if (existingLicense) {
                return NextResponse.json(
                    { message: "A doctor with this license number already exists" },
                    { status: 400 }
                );
            }

            // Create user and doctor profile in a transaction
            const user = await prisma.user.create({
                data: {
                    email,
                    phone: phone || null,
                    password: hashedPassword,
                    role: "DOCTOR",
                    emailVerified: false,
                    isActive: false, // Doctors need verification before activation
                    doctor: {
                        create: {
                            firstName,
                            lastName,
                            specialization,
                            qualification,
                            experience: parseInt(experience),
                            licenseNumber,
                            licenseVerified: false, // Needs admin verification
                            consultationFee: parseFloat(consultationFee),
                            about: otherData.about || null,
                            address: otherData.address || null,
                            city: otherData.city || null,
                            state: otherData.state || null,
                            zipCode: otherData.zipCode || null,
                            isAvailable: false, // Not available until verified
                        },
                    },
                },
                include: {
                    doctor: true,
                },
            });

            return NextResponse.json(
                {
                    message:
                        "Doctor account created successfully. Your account is pending verification by an administrator.",
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                    },
                },
                { status: 201 }
            );
        } else {
            return NextResponse.json(
                { message: "Invalid role. Must be PATIENT or DOCTOR" },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
