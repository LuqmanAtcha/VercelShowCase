import { Question } from "../models/question.model.js";
import { Answer } from "../models/answer.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Add question (duplicate check removed)
const addQuestions = asyncHandler(async (req, res) => {
  const { question, questionType } = req.body;

  if (
    typeof question !== "string" ||
    typeof questionType !== "string" ||
    !question.trim() ||
    !questionType.trim()
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const normalizedQuestion = question.toLowerCase().trim();

  // NO DUPLICATE CHECK HERE

  const questionObj = await Question.create({
    question: normalizedQuestion,
    questionType,
  });

  const questionCreated = await Question.findById(questionObj._id);

  if (!questionCreated) {
    throw new ApiError(500, "Something went wrong while adding Question to DB");
  }

  return res.status(201).json(
    new ApiResponse(
      200,
      questionCreated,
      "Question added to DB successfully "
    )
  );
});

// Get questions (with pagination)
const getQuestion = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const questions = await Question.find({})
    .select("question questionType questionCategory questionLevel")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  if (questions.length === 0) {
    return res.status(404).json(new ApiError(404, "No questions Found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, questions, "Questions Retrieved Successfully"));
});

// Update question by ID
const updateQuestionById = asyncHandler(async (req, res) => {
  const { questionID, question, questionCategory, questionType, questionLevel } = req.body;
  const queryQuestion = await Question.findByIdAndUpdate(
    questionID,
    {
      $set: {
        question,
        questionCategory,
        questionLevel,
        questionType,
      },
    },
    { new: true }
  );

  if (!queryQuestion) {
    return res.status(404).json(new ApiError(404, "Specified Question Not Found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, queryQuestion, "Question Updated Successfully"));
});

// Delete question by ID
const deleteQuestionById = asyncHandler(async (req, res) => {
  const { questionID } = req.body;
  const question = await Question.deleteOne({ _id: questionID });

  if (question.deletedCount === 0) {
    return res.status(404).json(new ApiError(404, "No questions were deleted"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, question, "Question Deleted Successfully"));
});

// Add answer to question
const addAnswerToQuestion = asyncHandler(async (req, res) => {
  const { questionID, answerText } = req.body;

  if (
    typeof questionID !== "string" ||
    typeof answerText !== "string" ||
    !questionID.trim() ||
    !answerText.trim()
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const answerObj = new Answer({
    answer: answerText.toLowerCase().trim(),
  });

  const question = await Question.findByIdAndUpdate(
    questionID,
    { $push: { answers: answerObj } },
    { new: true }
  );

  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  return res.status(200).json(new ApiResponse(200, answerObj, "Answer added successfully"));
});

// Delete answer by ID
const deleteAnswerByID = asyncHandler(async (req, res) => {
  const { questionID, answerID } = req.body;

  if (
    typeof questionID !== "string" ||
    typeof answerID !== "string" ||
    !questionID.trim() ||
    !answerID.trim()
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const question = await Question.findByIdAndUpdate(
    questionID,
    { $pull: { answers: { _id: answerID } } },
    { new: true }
  );

  if (!question) {
    throw new ApiError(404, "Question not found or answer not found");
  }

  return res.status(200).json(new ApiResponse(200, question, "Answer deleted successfully"));
});

// Get all answers for a question
const getAnswersByQuestionId = asyncHandler(async (req, res) => {
  const { questionID } = req.params;

  if (!questionID) {
    throw new ApiError(400, "questionID parameter is required");
  }

  const question = await Question.findById(questionID).select("answers");

  if (!question) {
    return res.status(404).json(new ApiError(404, "Question not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, question.answers, "Answers fetched successfully"));
});

export {
  addQuestions,
  getQuestion,
  updateQuestionById,
  deleteQuestionById,
  addAnswerToQuestion,
  deleteAnswerByID,
  getAnswersByQuestionId,
};
