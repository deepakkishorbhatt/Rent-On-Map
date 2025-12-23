import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const user = await User.findOne({ email: session.user.email }).select('-password');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Fetch profile error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();

        // This is where we handle "Request Verification"
        // In a real app, this might trigger an email or admin notification.
        // For MVP, we update status to 'pending'

        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            { verificationStatus: 'pending' },
            { new: true }
        ).select('-password');

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Update profile error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
