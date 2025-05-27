import { Router } from "express";
import {
  addQuestions,
  getQuestion,
} from "../controllers/question.controller.js";
import { addAnswerToQuestion } from "../controllers/answer.controller.js";
import { checkApiKey } from "../middlewares/apiKey.js";
import checkIfAdminRoute from "../middlewares/isAdmin.js";

const surveyRouter = Router();

// [ POST ] METHOD to add questions to DB alongside API-KEY check middleware
surveyRouter.route("/surveyQuestions").post(checkApiKey, addQuestions);

// [ GET ] METHOD to retrieve all the questions follows pagination for users ONLY
surveyRouter.route("/").get(checkApiKey, checkIfAdminRoute, getQuestion);

// [ PUT ] METHOD to add answeres to the questions
surveyRouter.route("/").put(checkApiKey, addAnswerToQuestion);

export default surveyRouter;
