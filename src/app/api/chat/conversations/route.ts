
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Conversation from '@/models/Conversation';
import User from '@/models/User';
import Property from '@/models/Property';

// Helper to ensure DB connection
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(process.env.MONGODB_URI as string);
};

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Find user by email to get ID
        const user = await User.findOne({ email: session.user.email });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Find conversations where user is a participant
        const conversations = await Conversation.find({
            participants: user._id
        })
            .populate('participants', 'name email image')
            .populate('propertyId', 'title location images price')
            .sort({ lastMessageAt: -1 });

        return NextResponse.json({ conversations });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { propertyId, ownerId } = await req.json();

        if (!propertyId || !ownerId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await connectDB();

        const currentUser = await User.findOne({ email: session.user.email });
        if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Check if conversation already exists
        let conversation = await Conversation.findOne({
            participants: { $all: [currentUser._id, ownerId] },
            propertyId: propertyId
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [currentUser._id, ownerId],
                propertyId: propertyId,
                lastMessage: 'Started conversation',
                unreadCount: {
                    [ownerId]: 1 // Mark as unread for owner initially
                }
            });
        }

        return NextResponse.json({ conversationId: conversation._id });

    } catch (error) {
        console.error('Error creating conversation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
