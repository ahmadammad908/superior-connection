import { Schema, model, models } from "mongoose";

const VoteSchema = new Schema(
  {
    pairId: { type: Schema.Types.ObjectId, ref: "VotingPair", required: true },
    voterId: { type: String, required: true }, // Clerk user id
    selectedStudentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
  },
  { timestamps: true }
);

VoteSchema.index({ pairId: 1, voterId: 1 }, { unique: true });

export const Vote = models.Vote || model("Vote", VoteSchema);