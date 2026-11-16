import mongoose, { Schema, models, model } from "mongoose";
import { REPORT_REASONS, ReportReason } from "../lib/constants";

export { REPORT_REASONS };
export type { ReportReason };

export type ReportTargetType = "post" | "comment" | "user";
export type ReportStatus = "pending" | "dismissed" | "resolved";

export interface IReport {
  _id: mongoose.Types.ObjectId;
  reporterId: string; // Clerk userId
  reporterName?: string;
  targetType: ReportTargetType;
  targetId: string;
  postId?: mongoose.Types.ObjectId;
  commentId?: mongoose.Types.ObjectId;
  reportedUserId?: string;
  reason: string;
  details?: string;
  status: ReportStatus;
  actionTaken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reporterId: { type: String, required: true, index: true },
    reporterName: { type: String, default: "" },
    targetType: {
      type: String,
      enum: ["post", "comment", "user"],
      required: true,
      index: true,
    },
    targetId: { type: String, required: true, index: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post" },
    commentId: { type: Schema.Types.ObjectId, ref: "Comment" },
    reportedUserId: { type: String, default: "" },
    reason: { type: String, required: true },
    details: { type: String, default: "", maxlength: 500 },
    status: {
      type: String,
      enum: ["pending", "dismissed", "resolved"],
      default: "pending",
      index: true,
    },
    actionTaken: { type: String, default: "" },
  },
  { timestamps: true }
);

ReportSchema.index({ status: 1, createdAt: -1 });

if (models.Report) {
  delete models.Report;
}

export const Report = model<IReport>("Report", ReportSchema);
export default Report;
