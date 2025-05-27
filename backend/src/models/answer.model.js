import mongoose, { Schema } from "mongoose";

const answerSchema = new Schema(
  {
  questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
  answer: { type: String, required: false, trim: true },
  score: { type: Number, required: false, min: 0 },
  rank: { type: Number, required: false, min: 1 },
  isRevealed: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export { answerSchema };
export const Answer = mongoose.model("Answer", answerSchema);

