import { Question } from "../models/question.model.js";
import { Answer } from "../models/answer.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Add question (duplicate check removed)
const addQuestions = asyncHandler(async (req, res) => {
  console.log("[addQuestions] Payload:", req.body);

  // NOW extracts all required fields
  const { question, questionType, questionCategory, questionLevel } = req.body;

  if (
    typeof question !== "string" ||
    typeof questionType !== "string" ||
    typeof questionCategory !== "string" ||
    typeof questionLevel !== "string" ||
    !question.trim() ||
    !questionType.trim() ||
    !questionCategory.trim() ||
    !questionLevel.trim()
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const normalizedQuestion = question.toLowerCase().trim();

  // Now stores category and level too!
  const questionObj = await Question.create({
    question: normalizedQuestion,
    questionType,
    questionCategory,
    questionLevel,
  });

  const questionCreated = await Question.findById(questionObj._id);

  if (!questionCreated) {
    throw new ApiError(500, "Something went wrong while adding Question to DB");
  }

  console.log("[addQuestions] Created question:", questionCreated);
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        questionCreated,
        "Question added to DB successfully "
      )
    );
});

// The rest of your controller code remains unchanged...

const getQuestion = asyncHandler(async (req, res) => {
  console.log("[getQuestion] Query:", req.query);

  const page = Number(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const questions = await Question.find({})
    .select("question questionType questionCategory questionLevel")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  console.log("[getQuestion] Result:", questions);

  if (questions.length === 0) {
    return res.status(404).json(new ApiError(404, "No questions Found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, questions, "Questions Retrieved Successfully"));
});

// Update question by ID
const updateQuestionById = asyncHandler(async (req, res) => {
  console.log("[updateQuestionById] Payload:", req.body);

  const {
    questionID,
    question,
    questionCategory,
    questionType,
    questionLevel,
  } = req.body;
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

  console.log("[updateQuestionById] Updated question:", queryQuestion);

  if (!queryQuestion) {
    return res
      .status(404)
      .json(new ApiError(404, "Specified Question Not Found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, queryQuestion, "Question Updated Successfully"));
});

// Delete question by ID
const deleteQuestionById = asyncHandler(async (req, res) => {
  console.log("[deleteQuestionById] Payload:", req.body);

  const { questionID } = req.body;
  const question = await Question.deleteOne({ _id: questionID });

  console.log("[deleteQuestionById] Result:", question);

  if (question.deletedCount === 0) {
    return res.status(404).json(new ApiError(404, "No questions were deleted"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, question, "Question Deleted Successfully"));
});

// Add answer to question
const addAnswerToQuestion = asyncHandler(async (req, res) => {
  console.log("[addAnswerToQuestion] Payload:", req.body);

  const { questionID, answerText } = req.body;

  // --- FIXED LOGIC: only require questionID
  if (typeof questionID !== "string" || !questionID.trim()) {
    throw new ApiError(400, "questionID is required");
  }

  // answerText can be "" (skipped)
  const answerObj = new Answer({
    answer: (typeof answerText === "string" ? answerText : "")
      .toLowerCase()
      .trim(),
  });

  const question = await Question.findByIdAndUpdate(
    questionID,
    { $push: { answers: answerObj } },
    { new: true }
  );

  console.log("[addAnswerToQuestion] Updated question:", question);

  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, answerObj, "Answer added successfully"));
});

// Delete answer by ID
const deleteAnswerByID = asyncHandler(async (req, res) => {
  console.log("[deleteAnswerByID] Payload:", req.body);

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

  console.log("[deleteAnswerByID] Updated question:", question);

  if (!question) {
    throw new ApiError(404, "Question not found or answer not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, question, "Answer deleted successfully"));
});

// Get all answers for a question
const getAnswersByQuestionId = asyncHandler(async (req, res) => {
  console.log("[getAnswersByQuestionId] Params:", req.params);

  const { questionID } = req.params;

  if (!questionID) {
    throw new ApiError(400, "questionID parameter is required");
  }

  const question = await Question.findById(questionID).select("answers");

  console.log("[getAnswersByQuestionId] Result:", question);

  if (!question) {
    return res.status(404).json(new ApiError(404, "Question not found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, question.answers, "Answers fetched successfully")
    );
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
