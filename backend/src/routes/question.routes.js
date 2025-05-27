import express from "express";
import { Question } from "../models/question.model.js";

const router = express.Router();

// GET /api/v1/questions?page=1
router.get("/", async (req, res) => {
  console.log("[INFO] GET /api/v1/questions called");
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 20;
    const skip = (page - 1) * pageSize;
    console.log(`[DEBUG] Pagination: page=${page}, pageSize=${pageSize}, skip=${skip}`);
    const [total, questions] = await Promise.all([
      Question.countDocuments(),
      Question.find().skip(skip).limit(pageSize),
    ]);
    console.log(`[SUCCESS] GET questions: Total=${total}, Returned=${questions.length}`);
    res.json({ total, page, pageSize, questions });
  } catch (err) {
    console.error("[ERROR] Error fetching questions:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/questions/surveyQuestions
router.post("/surveyQuestions", async (req, res) => {
  console.log("[INFO] POST /api/v1/questions/surveyQuestions called");
  try {
    const questions = Array.isArray(req.body) ? req.body : [req.body];
    console.log(`[DEBUG] Inserting ${questions.length} questions`);
    const saved = await Question.insertMany(questions);
    console.log(`[SUCCESS] Questions created: ${saved.length}`);
    res.status(201).json({
      message: "Questions saved.",
      count: saved.length,
      questions: saved,
    });
  } catch (err) {
    console.error("[ERROR] Failed to create questions:", err);
    res.status(500).json({ error: err.message });
  }
});


// PUT /api/v1/questions/:id
router.put("/questions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Question.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Question not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// DELETE /api/v1/questions
router.delete("/", async (req, res) => {
  console.log("[INFO] DELETE /api/v1/questions called");
  try {
    const result = await Question.deleteMany({});
    console.log(`[SUCCESS] All questions deleted. Count: ${result.deletedCount}`);
    res.json({
      message: "All questions deleted",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("[ERROR] Failed to delete questions:", err);
    res.status(500).json({ error: err.message });
  }
});


export default router;
