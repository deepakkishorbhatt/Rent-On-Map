import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    image?: string;
    isVerified?: boolean;
    verificationStatus?: 'unverified' | 'pending' | 'verified';
    savedProperties: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String },
        image: { type: String },
        isVerified: { type: Boolean, default: false },
        verificationStatus: {
            type: String,
            enum: ['unverified', 'pending', 'verified'],
            default: 'unverified'
        },
        savedProperties: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
    },
    { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
