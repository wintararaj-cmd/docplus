'use client';

import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Send, Paperclip, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Message } from '@/hooks/useSocket';
import toast from 'react-hot-toast';

interface ChatWindowProps {
    messages: Message[];
    currentUserId: string;
    otherUser: {
        id: string;
        name: string;
        role: string;
        isOnline?: boolean;
    };
    typingUsers: { userId: string; email: string }[];
    onSendMessage: (content: string, isEmergency?: boolean, file?: { url: string, name: string }) => void;
    onTyping: (isTyping: boolean) => void;
    onMarkAsRead: (messageIds: string[]) => void;
    isEmergencyMode?: boolean;
    onToggleEmergency?: () => void;
}

export function ChatWindow({
    messages,
    currentUserId,
    otherUser,
    typingUsers,
    onSendMessage,
    onTyping,
    onMarkAsRead,
    isEmergencyMode = false,
    onToggleEmergency,
}: ChatWindowProps) {
    const [messageInput, setMessageInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Mark unread messages as read
    useEffect(() => {
        const unreadMessages = messages.filter(
            (msg) => msg.senderId !== currentUserId && msg.status !== 'read'
        );
        if (unreadMessages.length > 0) {
            onMarkAsRead(unreadMessages.map((msg) => msg.id));
        }
    }, [messages, currentUserId, onMarkAsRead]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageInput(e.target.value);

        // Send typing indicator
        onTyping(true);

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            onTyping(false);
        }, 2000);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!messageInput.trim() || isSending) return;

        setIsSending(true);
        onTyping(false);

        try {
            await onSendMessage(messageInput.trim(), isEmergencyMode);
            setMessageInput('');
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/chat/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Upload failed');
            }

            const data = await response.json();

            // Send message with file
            await onSendMessage('', isEmergencyMode, {
                url: data.fileUrl,
                name: data.fileName
            });

            toast.success('File sent successfully');
        } catch (error: any) {
            console.error('File upload error:', error);
            toast.error(error.message || 'Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    };

    const isTyping = typingUsers.some((user) => user.userId === otherUser.id);

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                            {otherUser.name.charAt(0).toUpperCase()}
                        </div>
                        {otherUser.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{otherUser.name}</h3>
                        <p className="text-xs text-gray-500">
                            {otherUser.isOnline ? 'Online' : 'Offline'}
                        </p>
                    </div>
                </div>

                {onToggleEmergency && (
                    <Button
                        variant={isEmergencyMode ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={onToggleEmergency}
                        className="gap-2"
                    >
                        <AlertCircle className="w-4 h-4" />
                        {isEmergencyMode ? 'Emergency Mode' : 'Emergency'}
                    </Button>
                )}
            </div>

            {/* Emergency Mode Banner */}
            {isEmergencyMode && (
                <div className="bg-red-50 border-b border-red-200 px-4 py-2">
                    <div className="flex items-center gap-2 text-red-800">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                            Emergency mode active - Your message will be prioritized
                        </span>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <p className="text-sm">No messages yet</p>
                        <p className="text-xs mt-1">Start a conversation!</p>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isSender = message.senderId === currentUserId;
                        return (
                            <div
                                key={message.id}
                                className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-lg px-4 py-2 ${isSender
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-900'
                                        } ${message.isEmergency ? 'ring-2 ring-red-500' : ''}`}
                                >
                                    {message.isEmergency && (
                                        <Badge variant="destructive" className="mb-2">
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            Emergency
                                        </Badge>
                                    )}
                                    <p className="text-sm break-words">{message.content}</p>
                                    {message.fileUrl && (
                                        <div className="mt-2 p-2 bg-white/10 rounded">
                                            <a
                                                href={message.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs underline flex items-center gap-1"
                                            >
                                                <Paperclip className="w-3 h-3" />
                                                {message.fileName || 'Attachment'}
                                            </a>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                        <span
                                            className={`text-xs ${isSender ? 'text-blue-100' : 'text-gray-500'
                                                }`}
                                        >
                                            {format(new Date(message.timestamp), 'HH:mm')}
                                        </span>
                                        {isSender && message.status && (
                                            <span className="text-xs text-blue-100">
                                                {message.status === 'read' && '✓✓'}
                                                {message.status === 'delivered' && '✓'}
                                                {message.status === 'sending' && '⏳'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg px-4 py-2">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,.pdf,.doc,.docx"
                />
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSending || isUploading}
                        title="Attach file"
                    >
                        {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Paperclip className="w-4 h-4" />
                        )}
                    </Button>
                    <Input
                        type="text"
                        value={messageInput}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                        className="flex-1"
                        disabled={isSending}
                    />
                    <Button
                        type="submit"
                        disabled={!messageInput.trim() || isSending}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    >
                        {isSending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
