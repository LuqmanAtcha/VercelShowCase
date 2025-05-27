import { Question } from "../models/question.model.js";
import { Answer } from "../models/answer.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const addAnswerToQuestion = asyncHandler(async (req, res) => {
 
  const { questionID, answerText } = req.body;

  if ([questionID, answerText].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const answerObj = new Answer({
    answer: answerText.toLowerCase().trim()
  });

  const question = await Question.findByIdAndUpdate(questionID,
    { $push: { answers: answerObj } }
  );

  return res.status(200).json(new ApiResponse(200, answerObj));
});

const deleteAnswerByID = asyncHandler(async (req, res) => {

  const { questionID, answerID } = req.body;

  const question = await Question.findByIdAndUpdate(questionID,
    { $pull: { answers: { _id: answerID } } },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, question));
});

export { addAnswerToQuestion, deleteAnswerByID };
