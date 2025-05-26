import mongoose, { Schema } from "mongoose";
import { QUESTION_CATEGORY, QUESTION_LEVEL, QUESTION_TYPE } from "../constants.js";

const questionSchema = new Schema(
  {
    question: { type: String, required: true, trim: true },
    questionType: {
      type: String,
      enum: Object.values(QUESTION_TYPE),
      required: false,
    },
    questionCategory: {
      type: String,
      enum: Object.values(QUESTION_CATEGORY),
      required: false,
    },
    questionLevel: {
      type: String,
      enum: Object.values(QUESTION_LEVEL),
      required: false,
    },
    timesSkipped: { type: Number, required: false, min: 0},
    answers: [ {type: Schema.Types.ObjectId, ref: "Answer", required: false} ], // Embedded answers
  },
  { timestamps: true }
);

export const Question = mongoose.model("Question", questionSchema);
