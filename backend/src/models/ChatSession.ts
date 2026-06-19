import mongoose, { Schema, Document } from 'mongoose';

export interface IChatSession extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    createdAt: Date;
    updatedAt: Date;
}

const ChatSessionSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, default: 'New Conversation' },
}, { timestamps: true });

export const ChatSession = mongoose.model<IChatSession>('ChatSession', ChatSessionSchema);
