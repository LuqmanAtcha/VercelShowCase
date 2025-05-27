import { Question } from "../models/question.model.js";
import { Answer } from "../models/answer.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// User adds answers to the questions [ POST ]
const addAnswerToQuestion = asyncHandler(async (req, res) => {
  // get response from FrontEnd
  const { questionID, answer } = req.body;

  // checking for empty validation
  if ([questionID, answer].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  // Creating a answer Object in AnswerScehma DB - creating an entery in DB
  const answerObj = await Answer.create({
    answer: answer.toLowerCase().trim(),
  });

  //Updating the QuestionScehma with Answer of that QuestionID -- linking answer to question
  const questionWithAnswer = await Question.findByIdAndUpdate(questionID, {
    $push: { answers: answerObj },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, questionWithAnswer, "Question Updated with Answers")
    );
});

const deleteAnswerByID = asyncHandler(async (req, res) => {
  const { questionID, answerID } = req.body;

  const question = await Question.findByIdAndUpdate(
    questionID,
    { $pull: { answers: { _id: answerID } } },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, question));
});

export { addAnswerToQuestion, deleteAnswerByID };
