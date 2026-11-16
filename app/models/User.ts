import mongoose, { Schema, models, model } from "mongoose";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  clerkId: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  department?: string;
  semester?: string;
  role: "student" | "admin";
  isBanned: boolean;
  banReason?: string;
  bannedUntil?: Date | null;
  savedPosts: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 300, trim: true },
    department: { type: String, default: "", trim: true },
    semester: { type: String, default: "", trim: true },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    isBanned: { type: Boolean, default: false, index: true },
    banReason: { type: String, default: "" },
    bannedUntil: { type: Date, default: null },
    savedPosts: [{ type: Schema.Types.ObjectId, ref: "Post", default: [] }],
  },
  { timestamps: true }
);

if (models.User) {
  delete models.User;
}

export const User = model<IUser>("User", UserSchema);
export default User;
