import mongoose, { Schema, models, model } from "mongoose";

export interface IComment {
  _id: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  authorId: string; // Clerk userId
  author?: mongoose.Types.ObjectId;
  authorName: string;
  authorImage?: string;
  body: string;
  parentId?: mongoose.Types.ObjectId | null;
  replyToName?: string;
  likes: string[]; // Clerk userIds
  likesCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    authorId: { type: String, required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    authorName: { type: String, required: true, trim: true },
    authorImage: { type: String, default: "" },
    body: { type: String, required: true, trim: true, maxlength: 1000 },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    replyToName: { type: String, default: "" },
    likes: { type: [String], default: [] },
    likesCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CommentSchema.index({ postId: 1, isDeleted: 1, createdAt: 1 });
CommentSchema.index({ authorId: 1, createdAt: -1 });

if (models.Comment) {
  delete models.Comment;
}

export const Comment = model<IComment>("Comment", CommentSchema);
export default Comment;
