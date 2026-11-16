import mongoose, { Schema, models, model } from "mongoose";

export interface IConversation {
  _id: mongoose.Types.ObjectId;
  participants: string[]; // Clerk userIds [userId1, userId2]
  participantUsers: mongoose.Types.ObjectId[]; // User refs
  lastMessage?: string;
  lastMessageAt: Date;
  lastMessageSenderId?: string;
  unreadBy: string[]; // Clerk userIds who haven't read the latest message
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: {
      type: [String],
      required: true,
      index: true,
    },
    participantUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now, index: true },
    lastMessageSenderId: { type: String, default: "" },
    unreadBy: { type: [String], default: [] },
  },
  { timestamps: true }
);

ConversationSchema.index({ participants: 1, lastMessageAt: -1 });

if (models.Conversation) {
  delete models.Conversation;
}

export const Conversation =
  model<IConversation>("Conversation", ConversationSchema);
export default Conversation;
