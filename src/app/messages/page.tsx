'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { ChatWindow } from '@/components/ChatWindow';
import { Loader2, MessageSquare, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { EmptyState } from '@/components/EmptyState';

interface Conversation {
    _id: string;
    participants: {
        _id: string;
        name: string;
        image?: string;
    }[];
    propertyId: {
        title: string;
        images: string[];
    };
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: Record<string, number>;
}

export default function MessagesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    useEffect(() => {
        if (session?.user) {
            fetchConversations();
        }
    }, [session]);

    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/chat/conversations');
            const data = await res.json();
            if (data.conversations) {
                setConversations(data.conversations);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading' || (loading && session)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    }

    const selectedConversation = conversations.find(c => c._id === selectedConversationId);

    // Find the other participant
    const getOtherParticipant = (participants: Conversation['participants']) => {
        const other = participants.find(p => p.name !== session?.user?.name) || participants[0];
        return other;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col h-screen overflow-hidden">
            <Navbar />

            <div className="flex-1 flex w-full overflow-hidden">
                {/* Conversations List (Sidebar) */}
                <div className={`w-full md:w-1/3 bg-white border-r overflow-hidden flex flex-col ${selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b">
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <MessageSquare className="text-blue-600" /> Messages
                        </h1>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <EmptyState
                                icon={MessageSquare}
                                title="No messages yet"
                                description="Start a chat with an owner to ask about properties."
                                className="h-full border-0 bg-white"
                                actionLabel="Browse Properties"
                                onAction={() => router.push('/')}
                            />
                        ) : (
                            conversations
                                .filter(conv => {
                                    const query = searchParams.get('q')?.toLowerCase() || '';
                                    if (!query) return true;
                                    const other = getOtherParticipant(conv.participants);
                                    return other.name.toLowerCase().includes(query) ||
                                        (conv.lastMessage?.toLowerCase().includes(query)) ||
                                        (conv.propertyId?.title?.toLowerCase().includes(query));
                                })
                                .map(conv => {
                                    const other = getOtherParticipant(conv.participants);
                                    return (
                                        <div
                                            key={conv._id}
                                            onClick={() => setSelectedConversationId(conv._id)}
                                            className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${selectedConversationId === conv._id ? 'bg-blue-50' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={other.image} />
                                                    <AvatarFallback>{other.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-semibold text-sm truncate">{other.name}</h3>
                                                        {conv.lastMessageAt && (
                                                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                                                {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate mb-1">
                                                        {conv.propertyId?.title || 'Unknown Property'}
                                                    </p>
                                                    <p className="text-sm text-gray-600 truncate">
                                                        {conv.lastMessage || 'Start the conversation'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                        )}
                    </div>
                </div>

                {/* Chat Window (Main) */}
                <div className={`flex-1 bg-white overflow-hidden flex flex-col ${!selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
                    {selectedConversationId ? (
                        <>
                            <ChatWindow
                                conversationId={selectedConversationId}
                                recipientName={getOtherParticipant(selectedConversation!.participants).name}
                                recipientImage={getOtherParticipant(selectedConversation!.participants).image}
                                onBack={() => setSelectedConversationId(null)}
                            />
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8">
                            <EmptyState
                                icon={MessageSquare}
                                title="Your Messages"
                                description="Select a conversation from the left to start chatting."
                                className="border-0 bg-transparent"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
