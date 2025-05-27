import { Question } from "../models/question.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/*
adding the questions to database
these questions dont have any answers. Just the questions and their type
*/
const addQuestions = asyncHandler(async (req, res) => {
  // get the response from frontend
  const { question, questionCategory, questionLevel, questionType } = req.body;

  // checking for empty validation
  if (
    [question, questionCategory, questionLevel].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const normalizedQuestion = question.toLowerCase().trim();

  //looking for existing question with same type, Category and Level
  const existedQuestion = await Question.findOne({
    question: normalizedQuestion,
    questionType: questionType,
    questionCategory: questionCategory,
    questionLevel: questionLevel,
  });

  // throw error if question exists
  if (existedQuestion) {
    throw new ApiError(
      409,
      "Question with same Question Type, Category and Question Level already exists"
    );
  }

  // Creating a question Object - creating an entery in DB
  const questionObj = await Question.create({
    question: normalizedQuestion,
    questionCategory: questionCategory,
    questionLevel: questionLevel,
    questionType: questionType,
  });

  // validating if qustion Object was created
  const questionCreated = await Question.findById(questionObj._id);

  // throw error if question was not created
  if (!questionCreated) {
    throw new ApiError(500, "Something went wrong while adding Question to DB");
  }

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

// User requests the questions
const getQuestion = asyncHandler(async (req, res) => {
  /*
  FUTURE TO-DO:
  Add filter to show questions with same questionType
  OR
  just have another function called inside here if admins/users selects the filter button
  */

  // Pagination for limiting the data sent 10 per page
  const page = Number(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  // Retrieving only question and questionType for all the questions
  const questions = await Question.find({})
    .select("question questionCategory questionLevel")
    .sort({ createdAt: -1 }) // shows the latest questions on top
    .skip(skip)
    .limit(limit);
  // .populate("answers");

  // If no questions found Throw Error
  if (questions.length === 0) {
    return res.status(404).json(new ApiError(404, "No questions Found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, questions, "Questions Retrieved Successfully"));
});
export { addQuestions, getQuestion };
