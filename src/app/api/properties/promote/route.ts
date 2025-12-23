
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Property from '@/models/Property';
import User from '@/models/User';

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(process.env.MONGODB_URI as string);
};

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { propertyId, plan } = await req.json();

        if (!propertyId || !plan) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await connectDB();

        // Check if user owns the property
        const property = await Property.findById(propertyId);
        if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

        // Populate owner to check email/auth
        const currentUser = await User.findOne({ email: session.user.email });
        if (!currentUser || property.ownerId.toString() !== currentUser._id.toString()) {
            return NextResponse.json({ error: 'You do not own this property' }, { status: 403 });
        }

        // Calculate expiry based on plan
        const now = new Date();
        const durationDays = plan === '1_week' ? 7 : 30; // 1 week or 1 month
        const expiry = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

        // Update Property
        property.isFeatured = true;
        property.featuredExpiry = expiry;
        await property.save();

        return NextResponse.json({
            success: true,
            message: `Property promoted successfully until ${expiry.toDateString()}`,
            isFeatured: true,
            featuredExpiry: expiry
        });

    } catch (error) {
        console.error('Error promoting property:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
