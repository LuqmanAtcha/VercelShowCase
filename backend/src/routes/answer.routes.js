import express from "express";
import { Answer } from "../models/answer.model.js";
const router = express.Router();

// PUT /api/v1/answers
router.put("/", async (req, res) => {
  console.log("[INFO] PUT /api/v1/answers called");
  const { answers } = req.body; // <--- Here is your line!
  console.log("[DEBUG] Answers received:", answers);

  try {
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      console.warn("[WARN] No answers provided");
      return res.status(400).json({ error: "Answers array required" });
    }
    const saved = await Answer.insertMany(answers); // <--- And here is your line!
    console.log(`[SUCCESS] Answers created: ${saved.length}`);
    res.status(201).json({ message: 'Answers saved', answers: saved });
  } catch (err) {
    console.error("[ERROR] Failed to save answers:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
