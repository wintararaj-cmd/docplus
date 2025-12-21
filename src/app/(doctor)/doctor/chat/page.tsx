import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Clock } from "lucide-react";

export default function DoctorChat() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Chat</h1>
                <p className="text-gray-600 mt-1">
                    Communicate with your patients
                </p>
            </div>

            {/* Coming Soon Card */}
            <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
                <CardContent className="p-12 text-center">
                    <div className="bg-emerald-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <MessageSquare className="h-12 w-12 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        Chat Feature Coming Soon
                    </h2>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Real-time chat functionality with patients will be available in Phase 4.
                        This will include instant messaging, file sharing, and emergency alerts.
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-sm text-emerald-700">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Expected in Phase 4: Real-time Communication</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
