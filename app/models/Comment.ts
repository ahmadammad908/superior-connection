import { Schema, models, model } from "mongoose";

const CommentSchema = new Schema(
  {
    userId: { type: String, required: true }, // Clerk userId
    authorName: { type: String, required: true },
    authorImage: { type: String },
    body: { type: String, required: true, trim: true, maxlength: 300 },

    // null = normal comment, warna top-level comment ki _id (yani yeh reply hai)
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    // sirf tab set hota hai jab kisi reply ka reply ho
    replyToName: { type: String },
  },
  { timestamps: true }
);

CommentSchema.index({ createdAt: -1 });

// Purana cached model hatao taake naya schema use ho
if (models.Comment) {
  delete models.Comment;
}

export default model("Comment", CommentSchema);
