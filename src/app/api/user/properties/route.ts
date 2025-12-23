import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Property from '@/models/Property';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const User = mongoose.models.User;

        console.log('=== MY PROPERTIES DEBUG ===');
        console.log('Session email:', session.user.email);

        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            console.log('ERROR: User not found for email:', session.user.email);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log('Found user:', {
            _id: user._id.toString(),
            email: user.email,
            name: user.name
        });

        // Query using both ObjectId and string representation to handle legacy data
        const properties = await Property.find({
            $or: [
                { ownerId: user._id },
                { ownerId: user._id.toString() }
            ]
        }).sort({ createdAt: -1 });

        console.log('Found properties:', properties.length);

        if (properties.length > 0) {
            console.log('Property details:', properties.map(p => ({
                id: p._id.toString(),
                title: p.title,
                ownerId: p.ownerId?.toString(),
                ownerIdType: typeof p.ownerId
            })));
        } else {
            console.log('No properties found. Checking all properties in DB...');
            const allProps = await Property.find({}).limit(5);
            console.log('Sample properties:', allProps.map(p => ({
                id: p._id.toString(),
                title: p.title,
                ownerId: p.ownerId?.toString(),
                ownerIdType: typeof p.ownerId
            })));
        }

        return NextResponse.json({ properties });
    } catch (error: any) {
        console.error('Error fetching user properties:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
