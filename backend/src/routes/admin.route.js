import { Router } from "express";
import { getQuestion } from "../controllers/question.controller.js";
import { checkApiKey } from "../middlewares/apiKey.js";
import checkIfAdminRoute from "../middlewares/isAdmin.js";
import { deleteAnswerByID } from "../controllers/answer.controller.js";

const adminRouter = Router();

// [ GET ] this will get all the questions and Answers
adminRouter.route("/survey").get(checkApiKey, checkIfAdminRoute, getQuestion);

// [ DELETE ] delete the Asnwers by ID
adminRouter.route("/").delete(checkApiKey, checkIfAdminRoute, deleteAnswerByID);

export default adminRouter;
