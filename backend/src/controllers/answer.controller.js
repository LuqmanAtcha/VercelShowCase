import { Question } from "../models/question.model.js";
import { Answer } from "../models/answer.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addAnswerToQuestion = asyncHandler(async (req, res) => {
  console.log("[addAnswerToQuestion] Payload:", req.body);

  const { questionID, answerText } = req.body;

  if (!questionID || questionID.trim() === "") {
    console.log("[addAnswerToQuestion] ERROR: Missing fields.");
    throw new ApiError(400, "questionID is required");
  }

 const answerObj = new Answer({
  answer: (typeof answerText === "string" ? answerText : "").toLowerCase().trim(),
});


  const question = await Question.findByIdAndUpdate(
    questionID,
    { $push: { answers: answerObj } },
    { new: true }
  );

  console.log("[addAnswerToQuestion] Updated Question:", question);

  return res.status(200).json(new ApiResponse(200, answerObj));
});

const deleteAnswerByID = asyncHandler(async (req, res) => {
  console.log("[deleteAnswerByID] Payload:", req.body);

  const { questionID, answerID } = req.body;

  const question = await Question.findByIdAndUpdate(
    questionID,
    { $pull: { answers: { _id: answerID } } },
    { new: true }
  );

  console.log("[deleteAnswerByID] Updated Question:", question);

  return res.status(200).json(new ApiResponse(200, question));
});

export { addAnswerToQuestion, deleteAnswerByID };
