import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Property from '@/models/Property';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';
import { uploadImage } from '@/lib/cloudinary';

export async function PUT(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;
        const body = await request.json();

        await dbConnect();

        const User = mongoose.models.User;
        const user = await User.findOne({ email: session.user.email });

        // Verify ownership
        const property = await Property.findOne({ _id: id, ownerId: user._id });
        if (!property) {
            return NextResponse.json({ error: 'Property not found or unauthorized' }, { status: 404 });
        }

        // Handle image uploads if there are new base64 images
        let finalImages = property.images;
        if (body.images && Array.isArray(body.images)) {
            const newImages = [];
            for (const imgStr of body.images) {
                if (typeof imgStr === 'string' && imgStr.startsWith('data:image')) {
                    const url = await uploadImage(imgStr);
                    newImages.push(url);
                } else {
                    newImages.push(imgStr); // Keep existing URLs
                }
            }
            finalImages = newImages;
        }

        // Update fields
        property.title = body.title || property.title;
        property.description = body.description || property.description;
        property.price = body.price || property.price;
        property.type = body.type || property.type;
        property.features = body.features || property.features;
        property.images = finalImages;

        if (body.lat && body.lng) {
            property.location = {
                type: 'Point',
                coordinates: [body.lng, body.lat]
            };
        }

        await property.save();

        return NextResponse.json({ property });
    } catch (error: any) {
        console.error('Error updating property:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        console.log('DELETE route called');

        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            console.log('Unauthorized: No session');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;
        console.log('Deleting property ID:', id);

        await dbConnect();

        const User = mongoose.models.User;
        const user = await User.findOne({ email: session.user.email });
        console.log('User found:', user?._id);

        // First, find the property to get image URLs
        const property = await Property.findOne({ _id: id, ownerId: user._id });

        if (!property) {
            console.log('Property not found or unauthorized');
            return NextResponse.json({ error: 'Property not found or unauthorized' }, { status: 404 });
        }

        console.log('Property found, deleting images...');

        // Delete images from Cloudinary
        if (property.images && Array.isArray(property.images)) {
            const { deleteImage } = await import('@/lib/cloudinary');
            for (const imageUrl of property.images) {
                if (imageUrl && typeof imageUrl === 'string') {
                    console.log('Deleting image:', imageUrl);
                    await deleteImage(imageUrl);
                }
            }
        }

        console.log('Deleting property from database...');
        // Delete the property from database
        await Property.deleteOne({ _id: id, ownerId: user._id });

        console.log('Property deleted successfully');
        return NextResponse.json({ message: 'Property deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting property:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
