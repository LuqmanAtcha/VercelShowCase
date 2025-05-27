import express from "express";
import { Answer } from "../models/answer.model.js";
import { Question } from "../models/question.model.js";

const router = express.Router();

// PUT /api/v1/answers
router.put("/", async (req, res) => {
  console.log("[INFO] PUT /api/v1/answers called");
  const { answers } = req.body;
  console.log("[DEBUG] Answers received:", answers);

  try {
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: "Answers array required" });
    }
    // Insert all answers
    const savedAnswers = await Answer.insertMany(answers);

    // For each answer, push its ID into the corresponding question
    await Promise.all(
      savedAnswers.map((a) =>
        Question.findByIdAndUpdate(
          a.questionId,
          { $push: { answers: a._id } }
        )
      )
    );

    res
      .status(201)
      .json({ message: "Answers saved & linked", answers: savedAnswers });
  } catch (err) {
    console.error("[ERROR] Failed to save answers:", err);
    res.status(500).json({ error: err.message });
  }
});

// ADD THIS GET ROUTE:
router.get("/", async (req, res) => {
  try {
    const answers = await Answer.find();
    res.status(200).json({ answers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// DELETE /api/v1/answers
router.delete("/", async (req, res) => {
  try {
    const result = await Answer.deleteMany({});
    await Question.updateMany({}, { $set: { answers: [] } }); // optional
    res.json({
      message: "All answers deleted (and answer refs removed from questions)",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
