import Link from "next/link";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
            <Card className="max-w-md w-full shadow-xl">
                <CardContent className="p-12 text-center">
                    <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldX className="h-10 w-10 text-red-600" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Access Denied
                    </h1>

                    <p className="text-gray-600 mb-8">
                        You don't have permission to access this page. This area is restricted to administrators only.
                    </p>

                    <div className="space-y-3">
                        <Link href="/login" className="block">
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                Go to Login
                            </Button>
                        </Link>

                        <Link href="/" className="block">
                            <Button variant="outline" className="w-full">
                                Go to Home
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
