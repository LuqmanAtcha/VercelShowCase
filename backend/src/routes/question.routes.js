import { Router } from "express";
import {
  addQuestions,
  deleteQuestionById,
  getQuestion,
  updateQuestionById,
} from "../controllers/question.controller.js";
import { checkApiKey } from "../middlewares/apiKey.js";

const questionRouter = Router();

questionRouter.route("/surveyQuestions").post(checkApiKey, addQuestions);
questionRouter.route("/").put(checkApiKey, updateQuestionById);
questionRouter.route("/").delete(checkApiKey, deleteQuestionById);
questionRouter.route("/").get(checkApiKey, getQuestion);

export default questionRouter;
