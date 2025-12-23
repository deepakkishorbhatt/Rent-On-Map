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
            const properties = await Property.find().limit(100).populate('ownerId', 'name email isVerified image');
            return NextResponse.json({ properties });
        }

        await dbConnect();

        // Mongo uses [lng, lat]
        // Debug logging
        console.log('Search Params:', Object.fromEntries(searchParams.entries()));

        const query: any = {
            location: {
                $geoWithin: {
                    $box: [
                        [minLng, minLat], // Bottom-Left (South-West) coordinates
                        [maxLng, maxLat], // Top-Right (North-East) coordinates
                    ],
                },
            },
            price: {
                $gte: parseFloat(searchParams.get('minPrice') || '0'),
                $lte: parseFloat(searchParams.get('maxPrice') || '10000000')
            }
        };

        if (searchParams.get('type')) {
            query.type = searchParams.get('type');
        }

        // Handle features (furnishing and tenant preference)
        const features = [];
        if (searchParams.get('furnishing')) {
            const f = searchParams.get('furnishing');
            if (f === 'Full') features.push('Fully Furnished');
            else if (f === 'Semi') features.push('Semi Furnished');
            else if (f === 'None') features.push('Unfurnished');
        }
        if (searchParams.get('tenantPreference')) {
            const t = searchParams.get('tenantPreference');
            if (t && t !== 'Any') features.push(t);
        }

        if (features.length > 0) {
            query.features = { $all: features };
        }

        console.log('Mongo Query:', JSON.stringify(query, null, 2));

        const properties = await Property.find(query).populate('ownerId', 'name email isVerified image');

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
            bedrooms: body.bedrooms,
            bathrooms: body.bathrooms,
            area: body.area,
            contactNumber: body.contactNumber,
            location: {
                type: 'Point',
                coordinates: [lng, lat] // GeoJSON is [lng, lat]
            }
        });

        return NextResponse.json({ property: newProperty }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating property:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        return NextResponse.json({
            error: error.message || 'Internal Server Error',
            details: error.toString()
        }, { status: 500 });
    }
}
