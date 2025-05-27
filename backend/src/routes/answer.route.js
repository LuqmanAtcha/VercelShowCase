import { Router } from "express";
import {
  addAnswerToQuestion,
  deleteAnswerByID,
  getAnswersByQuestionId,
} from "../controllers/question.controller.js";
// import { checkApiKey } from "../middlewares/apiKey.js";

const answerRouter = Router();

// answerRouter.route("/answer").put(checkApiKey, addAnswerToQuestion);
// answerRouter.route("/answer").delete(checkApiKey, deleteAnswerByID);
// answerRouter.route("/answers/:questionID").get(checkApiKey, getAnswersByQuestionId);

answerRouter.route("/answer").put(addAnswerToQuestion);
answerRouter.route("/answer").delete(deleteAnswerByID);
answerRouter.route("/answers/:questionID").get(getAnswersByQuestionId);

export default answerRouter;
