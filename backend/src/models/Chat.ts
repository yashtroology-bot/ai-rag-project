import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
    sessionId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    role: 'user' | 'ai';
    content: string;
    createdAt: Date;
}

const ChatSchema: Schema = new Schema({
    sessionId: { type: Schema.Types.ObjectId, ref: 'ChatSession', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['user', 'ai'], required: true },
    content: { type: String, required: true },
}, { timestamps: true });

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);
