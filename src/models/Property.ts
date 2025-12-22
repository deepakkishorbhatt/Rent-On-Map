import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProperty extends Document {
    title: string;
    description: string;
    price: number;
    type: 'Shop' | 'Home' | 'Land';
    images: string[];
    features: string[]; // e.g. "Fully Furnished", "Bachelors Allowed", "2BHK"
    ownerId: string;
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
        type: { type: String, enum: ['Shop', 'Home', 'Land'], required: true },
        images: { type: [String], default: [] },
        features: { type: [String], default: [] },
        ownerId: { type: String, required: true },
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
