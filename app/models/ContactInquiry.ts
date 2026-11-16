import mongoose, { Schema, models, model } from "mongoose";

export interface IContactInquiry {
  _id: mongoose.Types.ObjectId;
  userId?: string;
  name: string;
  email: string;
  department?: string;
  category: "General" | "Academics" | "Hostel" | "Transport" | "Fees" | "Technical";
  subject: string;
  message: string;
  status: "pending" | "resolved";
  createdAt: Date;
  updatedAt: Date;
}

const ContactInquirySchema = new Schema<IContactInquiry>(
  {
    userId: { type: String, default: "" },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    department: { type: String, default: "" },
    category: {
      type: String,
      enum: ["General", "Academics", "Hostel", "Transport", "Fees", "Technical"],
      default: "General",
    },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 3000 },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

if (models.ContactInquiry) {
  delete models.ContactInquiry;
}

export const ContactInquiry =
  model<IContactInquiry>("ContactInquiry", ContactInquirySchema);
export default ContactInquiry;
