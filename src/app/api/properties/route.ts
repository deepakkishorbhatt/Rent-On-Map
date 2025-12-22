import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Property from '@/models/Property';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';
import { uploadImage } from '@/lib/cloudinary';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const minLat = parseFloat(searchParams.get('minLat') || '');
        const maxLat = parseFloat(searchParams.get('maxLat') || '');
        const minLng = parseFloat(searchParams.get('minLng') || '');
        const maxLng = parseFloat(searchParams.get('maxLng') || '');

        if (isNaN(minLat) || isNaN(maxLat) || isNaN(minLng) || isNaN(maxLng)) {
            // If no bounds provided, return all properties (or limited set) - for now return empty or simple limit
            // Let's return all for MVP or limit to 100 recent
            await dbConnect();
            const properties = await Property.find().limit(100);
            return NextResponse.json({ properties });
        }

        await dbConnect();

        // Mongo uses [lng, lat]
        const properties = await Property.find({
            location: {
                $geoWithin: {
                    $box: [
                        [minLng, minLat], // Bottom-Left (South-West) coordinates
                        [maxLng, maxLat], // Top-Right (North-East) coordinates
                    ],
                },
            },
            // Filters
            ...(searchParams.get('type') ? { type: searchParams.get('type') } : {}),
            ...(searchParams.get('furnishing') ? { features: searchParams.get('furnishing') === 'Full' ? 'Fully Furnished' : searchParams.get('furnishing') === 'Semi' ? 'Semi Furnished' : 'Unfurnished' } : {}), // Simplified mapping for MVP
            // For Tenant Preference, assuming it's in features array
            ...(searchParams.get('tenantPreference') ? { features: searchParams.get('tenantPreference') } : {}),
            price: {
                $gte: parseFloat(searchParams.get('minPrice') || '0'),
                $lte: parseFloat(searchParams.get('maxPrice') || '10000000')
            },
        });

        return NextResponse.json({ properties });
    } catch (error: any) {
        console.error('Error fetching properties:', error);
        console.error('Error stack:', error.stack);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, price, type, images, lat, lng, features } = body;

        if (!title || !description || !price || !type || !lat || !lng) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        // Find owner
        const User = mongoose.models.User;
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Upload images
        const uploadedImages = [];
        if (images && Array.isArray(images)) {
            for (const imgStr of images) {
                if (imgStr.startsWith('data:image')) {
                    const url = await uploadImage(imgStr);
                    uploadedImages.push(url);
                } else {
                    uploadedImages.push(imgStr); // Assume it's already a URL if not base64
                }
            }
        }

        const newProperty = await Property.create({
            title,
            description,
            price,
            type,
            images: uploadedImages,
            ownerId: user._id,
            features: features || [],
            location: {
                type: 'Point',
                coordinates: [lng, lat] // GeoJSON is [lng, lat]
            }
        });

        return NextResponse.json({ property: newProperty }, { status: 201 });

    } catch (error) {
        console.error('Error creating property:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
