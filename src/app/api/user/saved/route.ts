import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { propertyId } = await req.json();
        if (!propertyId) {
            return NextResponse.json({ error: 'Property ID required' }, { status: 400 });
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const index = user.savedProperties.indexOf(propertyId);
        let isSaved = false;

        if (index === -1) {
            // Add to saved
            user.savedProperties.push(propertyId);
            isSaved = true;
        } else {
            // Remove from saved
            user.savedProperties.splice(index, 1);
            isSaved = false;
        }

        await user.save();
        return NextResponse.json({ isSaved, savedProperties: user.savedProperties });
    } catch (error) {
        console.error('Save toggle error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        // Populate saved properties
        // Populate saved properties and their owners
        const user = await User.findOne({ email: session.user.email })
            .populate({
                path: 'savedProperties',
                populate: {
                    path: 'ownerId',
                    model: 'User',
                    select: 'name email image isVerified'
                }
            });

        return NextResponse.json({ savedProperties: user?.savedProperties || [] });
    } catch (error) {
        console.error('Fetch saved error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
