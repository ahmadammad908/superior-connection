import { Schema, model, models } from "mongoose";

const VotingPairSchema = new Schema(
  {
    leftId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    rightId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    active: { type: Boolean, default: false },
    round: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// Only one active pair at a time
VotingPairSchema.index(
  { active: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);

export const VotingPair =
  models.VotingPair || model("VotingPair", VotingPairSchema);