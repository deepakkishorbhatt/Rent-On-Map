
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IConversation extends Document {
    participants: mongoose.Types.ObjectId[];
    propertyId: mongoose.Types.ObjectId;
    lastMessage: string;
    lastMessageAt: Date;
    unreadCount: Map<string, number>;
    createdAt: Date;
    updatedAt: Date;
}

const ConversationSchema: Schema = new Schema({
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date, default: Date.now },
    unreadCount: {
        type: Map,
        of: Number,
        default: {}
    }
}, { timestamps: true });

// Compound index to quickly find chat between two users about a property
ConversationSchema.index({ participants: 1, propertyId: 1 });

const Conversation: Model<IConversation> = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;
