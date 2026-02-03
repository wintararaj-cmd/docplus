'use client';

import { format } from 'date-fns';
import { AlertCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Conversation {
    id: string;
    type: 'patient' | 'doctor';
    patient?: {
        id: string;
        firstName: string;
        lastName: string;
        bloodGroup?: string;
        user: { email: string };
    };
    doctor?: {
        id: string;
        firstName: string;
        lastName: string;
        specialization: string;
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

interface ConversationListProps {
    conversations: Conversation[];
    selectedConversationId: string | null;
    onSelectConversation: (id: string) => void;
    isOnline?: (userId: string) => boolean;
    userRole: 'PATIENT' | 'DOCTOR';
}

export function ConversationList({
    conversations,
    selectedConversationId,
    onSelectConversation,
    isOnline = () => false,
    userRole,
}: ConversationListProps) {
    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                <Clock className="w-12 h-12 mb-4" />
                <p className="text-sm text-center">No conversations yet</p>
                <p className="text-xs mt-1 text-center">
                    {userRole === 'PATIENT'
                        ? 'Start chatting with a doctor'
                        : 'Patients will appear here when they message you'}
                </p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-full">
            <div className="space-y-1 p-2">
                {conversations.map((conversation) => {
                    const isPatientView = userRole === 'PATIENT';
                    const otherUser = isPatientView ? conversation.doctor : conversation.patient;

                    if (!otherUser) return null;

                    const name = `${otherUser.firstName} ${otherUser.lastName}`;
                    const subtitle = isPatientView
                        ? conversation.doctor?.specialization
                        : conversation.patient?.bloodGroup;
                    const isSelected = conversation.id === selectedConversationId;
                    const online = isOnline(conversation.id);

                    return (
                        <button
                            key={conversation.id}
                            onClick={() => onSelectConversation(conversation.id)}
                            className={`w-full p-3 rounded-lg text-left transition-all ${isSelected
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                                    : 'bg-white hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${isSelected
                                                ? 'bg-white/20 text-white'
                                                : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                                            }`}
                                    >
                                        {name.charAt(0).toUpperCase()}
                                    </div>
                                    {online && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4
                                            className={`font-semibold text-sm truncate ${isSelected ? 'text-white' : 'text-gray-900'
                                                }`}
                                        >
                                            {name}
                                        </h4>
                                        {conversation.lastMessage && (
                                            <span
                                                className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-500'
                                                    }`}
                                            >
                                                {format(new Date(conversation.lastMessage.createdAt), 'HH:mm')}
                                            </span>
                                        )}
                                    </div>

                                    {subtitle && (
                                        <p
                                            className={`text-xs mb-1 ${isSelected ? 'text-blue-100' : 'text-gray-500'
                                                }`}
                                        >
                                            {subtitle}
                                        </p>
                                    )}

                                    {/* Last Message */}
                                    {conversation.lastMessage && (
                                        <p
                                            className={`text-xs truncate ${isSelected ? 'text-blue-100' : 'text-gray-600'
                                                }`}
                                        >
                                            {conversation.lastMessage.content}
                                        </p>
                                    )}

                                    {/* Badges */}
                                    <div className="flex items-center gap-2 mt-2">
                                        {conversation.hasEmergency && (
                                            <Badge
                                                variant="destructive"
                                                className="text-xs px-2 py-0 h-5"
                                            >
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                Emergency
                                            </Badge>
                                        )}
                                        {conversation.unreadCount > 0 && (
                                            <Badge
                                                className={`text-xs px-2 py-0 h-5 ${isSelected
                                                        ? 'bg-white text-blue-600'
                                                        : 'bg-blue-600 text-white'
                                                    }`}
                                            >
                                                {conversation.unreadCount}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </ScrollArea>
    );
}
