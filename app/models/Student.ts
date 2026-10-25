import { Schema, model, models } from "mongoose";

const StudentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    department: { type: String, trim: true },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
  },
  { timestamps: true }
);

export const Student = models.Student || model("Student", StudentSchema);