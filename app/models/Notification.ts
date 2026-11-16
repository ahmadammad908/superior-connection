import mongoose, { Schema, models, model } from "mongoose";

export type NotificationType =
  | "like_post"
  | "like_comment"
  | "comment_post"
  | "reply_comment"
  | "announcement"
  | "warning"
  | "message";

export interface INotification {
  _id: mongoose.Types.ObjectId;
  recipientId: string; // Clerk userId
  actorId: string; // Clerk userId
  actorName: string;
  actorImage?: string;
  type: NotificationType;
  postId?: mongoose.Types.ObjectId;
  commentId?: mongoose.Types.ObjectId;
  message?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: { type: String, required: true, index: true },
    actorId: { type: String, required: true },
    actorName: { type: String, required: true },
    actorImage: { type: String, default: "" },
    type: {
      type: String,
      enum: [
        "like_post",
        "like_comment",
        "comment_post",
        "reply_comment",
        "announcement",
        "warning",
        "message",
      ],
      required: true,
    },
    postId: { type: Schema.Types.ObjectId, ref: "Post" },
    commentId: { type: Schema.Types.ObjectId, ref: "Comment" },
    message: { type: String, default: "" },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipientId: 1, createdAt: -1 });

if (models.Notification) {
  delete models.Notification;
}

export const Notification =
  model<INotification>("Notification", NotificationSchema);
export default Notification;
