'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
    _id: string;
    content: string;
    senderId: {
        _id: string;
        name: string;
        image?: string;
    };
    createdAt: string;
}

function isSameDay(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

function getDateLabel(dateString: string) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) return 'Today';
    if (isSameDay(date, yesterday)) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
}

interface ChatWindowProps {
    conversationId: string;
    recipientName?: string;
    recipientImage?: string;
    onBack?: () => void;
}

export function ChatWindow({ conversationId, recipientName, recipientImage, onBack }: ChatWindowProps) {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
            const data = await res.json();
            if (data.messages) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and polling
    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, [conversationId]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const res = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId,
                    content: newMessage
                })
            });
            const data = await res.json();
            if (data.message) {
                setNewMessage('');
                fetchMessages(); // Refresh immediately
            }
        } catch (error) {
            console.error('Failed to send', error);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            {/* Header */}
            {recipientName && (
                <div className="p-2 px-3 border-b flex items-center gap-3 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                    {onBack && (
                        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden -ml-2 h-8 w-8">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <Avatar className="h-9 w-9 border border-gray-100">
                        <AvatarImage src={recipientImage} />
                        <AvatarFallback>{recipientName[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm">{recipientName}</span>
                </div>
            )}

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm mt-10">Start the conversation!</div>
                ) : (
                    messages.map((msg, index) => {
                        const isMyMessage = msg.senderId.name === session?.user?.name;
                        const showDateHeader = index === 0 || !isSameDay(new Date(messages[index - 1].createdAt), new Date(msg.createdAt));

                        return (
                            <div key={msg._id} className="flex flex-col gap-2">
                                {showDateHeader && (
                                    <div className="flex justify-center my-4">
                                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                            {getDateLabel(msg.createdAt)}
                                        </span>
                                    </div>
                                )}
                                <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-2 max-w-[80%] ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={msg.senderId.image} />
                                            <AvatarFallback>{msg.senderId.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className={`p-3 rounded-lg text-sm ${isMyMessage
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-gray-100 text-gray-800 rounded-tl-none'
                                            }`}>
                                            {msg.content}
                                            <div className={`text-[10px] mt-1 ${isMyMessage ? 'text-blue-200' : 'text-gray-400'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t bg-white">
                <form onSubmit={handleSend} className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </div>
        </div>
    );
}
