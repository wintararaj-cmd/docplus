'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Loader2 } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ConversationList } from '@/components/chat/ConversationList';
import toast from 'react-hot-toast';

interface Conversation {
    id: string;
    type: 'patient';
    patient: {
        id: string;
        firstName: string;
        lastName: string;
        bloodGroup?: string;
        user: { email: string };
    };
    lastMessage?: {
        content: string;
        createdAt: Date;
        isEmergency?: boolean;
    };
    unreadCount: number;
    hasEmergency?: boolean;
}

export default function DoctorChatPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [chatMessages, setChatMessages] = useState<any[]>([]);

    const {
        isConnected,
        messages: socketMessages,
        typingUsers,
        onlineUsers,
        joinChat,
        leaveChat,
        sendMessage,
        sendTyping,
        markAsRead,
        onEmergencyAlert,
        isUserOnline,
    } = useSocket();

    // Redirect if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    // Handle emergency alerts
    useEffect(() => {
        const cleanup = onEmergencyAlert && onEmergencyAlert((alert) => {
            toast.error(`⚠️ EMERGENCY: New alert from patient!`);
            // Refresh conversations to show the emergency
            fetchConversations();
        });

        return () => {
            if (cleanup) cleanup();
        };
    }, [onEmergencyAlert]);

    const fetchConversations = async () => {
        try {
            const response = await fetch('/api/chat/conversations');
            if (!response.ok) throw new Error('Failed to fetch conversations');
            const data = await response.json();
            setConversations(data.conversations || []);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            toast.error('Failed to load conversations');
        } finally {
            setIsLoadingConversations(false);
        }
    };

    // Fetch conversations on load
    useEffect(() => {
        if (session?.user) {
            fetchConversations();
        }
    }, [session]);

    // Fetch messages when conversation is selected
    useEffect(() => {
        if (!selectedConversationId || !session?.user?.id) return;

        const fetchMessages = async () => {
            setIsLoadingMessages(true);
            try {
                const response = await fetch(
                    `/api/chat/messages?patientId=${selectedConversationId}&doctorId=${session.user.id}`
                );
                if (!response.ok) throw new Error('Failed to fetch messages');
                const data = await response.json();
                setChatMessages(data.messages || []);

                // Join chat room
                joinChat(selectedConversationId, session.user.id);
            } catch (error) {
                console.error('Error fetching messages:', error);
                toast.error('Failed to load messages');
            } finally {
                setIsLoadingMessages(false);
            }
        };

        fetchMessages();

        return () => {
            if (session?.user?.id && selectedConversationId) {
                leaveChat(selectedConversationId, session.user.id);
            }
        };
    }, [selectedConversationId, session, joinChat, leaveChat]);

    // Merge socket messages with fetched messages
    const allMessages = [...chatMessages, ...socketMessages];

    const handleSendMessage = async (content: string, isEmergency?: boolean, file?: { url: string, name: string }) => {
        if (!session?.user?.id || !selectedConversationId) return;

        const messageId = `temp-${Date.now()}`;

        // Send via socket
        sendMessage({
            id: messageId,
            senderId: session.user.id,
            receiverId: selectedConversationId,
            content: content || (file ? 'Sent an attachment' : ''),
            isEmergency,
            fileUrl: file?.url,
            fileName: file?.name,
        });

        // Also persist to database
        try {
            const response = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId: selectedConversationId,
                    doctorId: session.user.id,
                    content: content || (file ? 'Sent an attachment' : ''),
                    isEmergency,
                    fileUrl: file?.url,
                    fileName: file?.name,
                }),
            });

            if (!response.ok) throw new Error('Failed to send message');
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        }
    };

    const handleTyping = (isTyping: boolean) => {
        if (!session?.user?.id || !selectedConversationId) return;
        sendTyping(selectedConversationId, session.user.id, isTyping);
    };

    const handleMarkAsRead = async (messageIds: string[]) => {
        if (!session?.user?.id || !selectedConversationId || messageIds.length === 0) return;

        // Mark via socket
        messageIds.forEach((id) => {
            markAsRead(id, selectedConversationId, session.user.id);
        });

        // Also update in database
        try {
            await fetch('/api/chat/messages', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageIds }),
            });
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

    if (status === 'loading' || isLoadingConversations) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex">
            {/* Conversations Sidebar */}
            <div className="w-80 border-r bg-gray-50">
                <div className="p-4 border-b bg-white">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-teal-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Patient Messages</h2>
                    </div>
                    {isConnected ? (
                        <p className="text-xs text-green-600 mt-1">● Connected</p>
                    ) : (
                        <p className="text-xs text-red-600 mt-1">● Disconnected</p>
                    )}
                </div>

                <ConversationList
                    conversations={conversations}
                    selectedConversationId={selectedConversationId}
                    onSelectConversation={setSelectedConversationId}
                    isOnline={isUserOnline}
                    userRole="DOCTOR"
                />
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-gray-100">
                {selectedConversation ? (
                    isLoadingMessages ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                        </div>
                    ) : (
                        <ChatWindow
                            messages={allMessages}
                            currentUserId={session?.user?.id || ''}
                            otherUser={{
                                id: selectedConversation.id,
                                name: `${selectedConversation.patient.firstName} ${selectedConversation.patient.lastName}`,
                                role: 'Patient',
                                isOnline: isUserOnline(selectedConversation.id),
                            }}
                            typingUsers={typingUsers}
                            onSendMessage={handleSendMessage}
                            onTyping={handleTyping}
                            onMarkAsRead={handleMarkAsRead}
                        />
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <MessageSquare className="w-16 h-16 mb-4" />
                        <p className="text-lg font-medium">Select a patient</p>
                        <p className="text-sm mt-1">Choose a conversation to reply to</p>
                    </div>
                )}
            </div>
        </div>
    );
}
