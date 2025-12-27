import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProperty extends Document {
    title: string;
    description: string;
    price: number;
    type: 'Flat' | 'House' | 'PG' | 'Shop' | 'Land';
    images: string[];
    features: string[]; // e.g. "Fully Furnished", "Bachelors Allowed"

    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    contactNumber?: string;

    // Address Info
    address?: string;
    pincode?: string;
    city?: string;

    isVerified?: boolean;
    isFeatured?: boolean;
    isVisible?: boolean;
    featuredExpiry?: Date;

    // Detailed room information (for House/Flat types)
    rooms?: {
        bedrooms: number;
        bathrooms: number;
        kitchen: boolean;
        livingRoom: boolean;
        diningRoom: boolean;
        balconies: number;
        parking: boolean;
        garden: boolean;
    };

    ownerId: string | mongoose.Types.ObjectId; // Populated or ID
    location: {
        type: 'Point';
        coordinates: number[]; // [lng, lat]
    };
}

const PropertySchema = new Schema<IProperty>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        type: { type: String, enum: ['Flat', 'House', 'PG', 'Shop', 'Land'], required: true },
        images: { type: [String], default: [] },
        features: { type: [String], default: [] },

        // Structured Details
        bedrooms: { type: Number }, // e.g. 2 for 2BHK
        bathrooms: { type: Number },
        area: { type: Number }, // in sq ft
        contactNumber: { type: String }, // Owner contact for this property

        // Address Info
        address: { type: String },
        pincode: { type: String },
        city: { type: String },

        isVerified: { type: Boolean, default: false },
        isFeatured: { type: Boolean, default: false },
        isVisible: { type: Boolean, default: true }, // Visibility toggle
        featuredExpiry: { type: Date },

        // Detailed room information
        rooms: {
            type: {
                bedrooms: { type: Number, default: 0 },
                bathrooms: { type: Number, default: 0 },
                kitchen: { type: Boolean, default: false },
                livingRoom: { type: Boolean, default: false },
                diningRoom: { type: Boolean, default: false },
                balconies: { type: Number, default: 0 },
                parking: { type: Boolean, default: false },
                garden: { type: Boolean, default: false },
            },
            required: false
        },

        ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
    },
    { timestamps: true }
);

// IMPORTANT: 2dsphere index for geospatial queries
PropertySchema.index({ location: '2dsphere' });

const Property: Model<IProperty> = mongoose.models.Property || mongoose.model<IProperty>('Property', PropertySchema);

export default Property;
