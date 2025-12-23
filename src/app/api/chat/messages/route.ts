
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import User from '@/models/User';

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(process.env.MONGODB_URI as string);
};

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const conversationId = searchParams.get('conversationId');

        if (!conversationId) return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });

        await connectDB();

        const messages = await Message.find({ conversationId })
            .sort({ createdAt: 1 })
            .populate('senderId', 'name image');

        return NextResponse.json({ messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { conversationId, content } = await req.json();

        if (!conversationId || !content) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        await connectDB();

        const sender = await User.findOne({ email: session.user.email });
        if (!sender) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // 1. Create Message
        const message = await Message.create({
            conversationId,
            senderId: sender._id,
            content,
            readBy: [sender._id]
        });

        // 2. Update Conversation (lastMessage, ordering, unread count)
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
            conversation.lastMessage = content;
            conversation.lastMessageAt = new Date();

            // Increment unread count for other participants
            conversation.participants.forEach((pId: any) => {
                const pIdStr = pId.toString();
                if (pIdStr !== sender._id.toString()) {
                    const currentCount = conversation.unreadCount.get(pIdStr) || 0;
                    conversation.unreadCount.set(pIdStr, currentCount + 1);
                }
            });

            await conversation.save();
        }

        return NextResponse.json({ message });

    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
