import mongoose, { Schema, models, model } from "mongoose";
import { POST_CATEGORIES, PostCategory } from "../lib/constants";

export { POST_CATEGORIES };
export type { PostCategory };

export interface IPost {
  _id: mongoose.Types.ObjectId;
  authorId: string; // Clerk userId
  author?: mongoose.Types.ObjectId; // User ref
  content: string;
  images: string[];
  video?: string;
  category: PostCategory;
  tags: string[];
  isAnonymous: boolean;
  isPinned: boolean;
  isAnnouncement: boolean;
  likes: string[]; // array of Clerk userIds
  likesCount: number;
  commentsCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    authorId: { type: String, required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: "User", index: true },
    content: { type: String, required: true, trim: true, maxlength: 4000 },
    images: {
      type: [String],
      default: [],
      validate: [
        (val: string[]) => val.length <= 4,
        "Cannot upload more than 4 images",
      ],
    },
    video: { type: String, default: "" },
    category: {
      type: String,
      enum: POST_CATEGORIES,
      default: "Other",
      required: true,
      index: true,
    },
    tags: { type: [String], default: [], index: true },
    isAnonymous: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false, index: true },
    isAnnouncement: { type: Boolean, default: false, index: true },
    likes: { type: [String], default: [] },
    likesCount: { type: Number, default: 0, index: true },
    commentsCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

PostSchema.index({ isPinned: -1, createdAt: -1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ likesCount: -1, createdAt: -1 });

if (models.Post) {
  delete models.Post;
}

export const Post = model<IPost>("Post", PostSchema);
export default Post;
