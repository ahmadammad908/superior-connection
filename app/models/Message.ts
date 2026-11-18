import mongoose, { Schema, models, model } from "mongoose";

export interface IMessage {
  _id: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  senderId: string; // Clerk userId
  sender?: mongoose.Types.ObjectId; // User ref
  recipientId: string; // Clerk userId
  text: string;
  mediaUrl?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: { type: String, required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    recipientId: { type: String, required: true, index: true },
    text: { type: String, default: "", trim: true, maxlength: 3000 },
    mediaUrl: { type: String, default: "" },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });
MessageSchema.index({ conversationId: 1, recipientId: 1, read: 1 });
MessageSchema.index({ senderId: 1, createdAt: -1 });

if (models.Message) {
  delete models.Message;
}

export const Message = model<IMessage>("Message", MessageSchema);
export default Message;
