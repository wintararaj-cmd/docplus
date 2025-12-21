import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Construction } from 'lucide-react'

export default function ChatPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages & Emergency Chat</h1>
                <p className="text-gray-600">Communicate with your doctors</p>
            </div>

            <Card className="border-0 shadow-lg">
                <CardContent className="py-16 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Construction className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Coming Soon</h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                        The chat and emergency messaging feature is currently under development.
                        This will allow you to communicate directly with your doctors and send emergency messages.
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                            <MessageSquare className="w-4 h-4" />
                            <span>Real-time messaging</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <MessageSquare className="w-4 h-4" />
                            <span>Emergency alerts</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Feature Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg">Direct Messaging</CardTitle>
                        <CardDescription>Chat with your doctors in real-time</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg">Emergency Chat</CardTitle>
                        <CardDescription>Priority messaging for urgent matters</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg">File Sharing</CardTitle>
                        <CardDescription>Share documents and images</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </div>
    )
}
