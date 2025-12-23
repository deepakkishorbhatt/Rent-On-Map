'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChatWindow } from "./ChatWindow";

interface ChatDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    conversationId: string | null;
    recipientName?: string;
}

export function ChatDrawer({ isOpen, onClose, conversationId, recipientName }: ChatDrawerProps) {
    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle>Chat {recipientName ? `with ${recipientName}` : ''}</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-hidden">
                    {conversationId ? (
                        <ChatWindow conversationId={conversationId} recipientName={recipientName} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Loading conversation...
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
