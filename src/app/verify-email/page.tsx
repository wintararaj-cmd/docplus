import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CheckCircle, XCircle, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function VerifyEmailContent({ token }: { token: string }) {
    if (!token) {
        return <VerificationError message="No verification token provided" />;
    }

    try {
        // Find user with this token
        const user = await prisma.user.findUnique({
            where: { verificationToken: token },
        });

        if (!user) {
            return <VerificationError message="Invalid verification token" />;
        }

        // Check if already verified
        if (user.emailVerified) {
            return <AlreadyVerified />;
        }

        // Check if token expired
        if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
            return <TokenExpired email={user.email} />;
        }

        // Verify the email
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationToken: null,
                verificationTokenExpiry: null,
            },
        });

        return <VerificationSuccess email={user.email} role={user.role} />;
    } catch (error) {
        console.error("Email verification error:", error);
        return <VerificationError message="An error occurred during verification" />;
    }
}

function VerificationSuccess({ email, role }: { email: string; role: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4">
            <Card className="max-w-md w-full shadow-xl">
                <CardContent className="p-12 text-center">
                    <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Email Verified!
                    </h1>

                    <p className="text-gray-600 mb-2">
                        Your email address has been successfully verified.
                    </p>
                    <p className="text-sm text-gray-500 mb-8">{email}</p>

                    {role === "DOCTOR" ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-yellow-800">
                                <strong>Note for Doctors:</strong> Your account is pending verification by an administrator. You'll receive an email once your credentials have been reviewed.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-green-800">
                                You can now login and access all features of your account.
                            </p>
                        </div>
                    )}

                    <Link href="/login">
                        <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                            Continue to Login
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}

function AlreadyVerified() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
            <Card className="max-w-md w-full shadow-xl">
                <CardContent className="p-12 text-center">
                    <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="h-10 w-10 text-blue-600" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Already Verified
                    </h1>

                    <p className="text-gray-600 mb-8">
                        This email address has already been verified. You can login to your account.
                    </p>

                    <Link href="/login">
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                            Go to Login
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}

function TokenExpired({ email }: { email: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 p-4">
            <Card className="max-w-md w-full shadow-xl">
                <CardContent className="p-12 text-center">
                    <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="h-10 w-10 text-orange-600" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Token Expired
                    </h1>

                    <p className="text-gray-600 mb-2">
                        This verification link has expired. Verification links are valid for 24 hours.
                    </p>
                    <p className="text-sm text-gray-500 mb-8">{email}</p>

                    <div className="space-y-3">
                        <Link href={`/resend-verification?email=${encodeURIComponent(email)}`}>
                            <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                                Resend Verification Email
                            </Button>
                        </Link>

                        <Link href="/login">
                            <Button variant="outline" className="w-full">
                                Back to Login
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function VerificationError({ message }: { message: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
            <Card className="max-w-md w-full shadow-xl">
                <CardContent className="p-12 text-center">
                    <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="h-10 w-10 text-red-600" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Verification Failed
                    </h1>

                    <p className="text-gray-600 mb-8">{message}</p>

                    <div className="space-y-3">
                        <Link href="/register">
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                Create New Account
                            </Button>
                        </Link>

                        <Link href="/login">
                            <Button variant="outline" className="w-full">
                                Back to Login
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default async function VerifyEmailPage({
    searchParams,
}: {
    searchParams: { token?: string };
}) {
    const token = searchParams.token;

    if (!token) {
        return <VerificationError message="No verification token provided" />;
    }

    return (
        <Suspense fallback={<div>Verifying...</div>}>
            <VerifyEmailContent token={token} />
        </Suspense>
    );
}
