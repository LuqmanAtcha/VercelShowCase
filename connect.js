require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
app.use(cors());

const uri = process.env.MONGODB_URI;

// Log connection attempt
console.log("[INFO] Connecting to MongoDB with URI:", uri ? uri.substring(0, 40) + '...' : "No URI Provided");
mongoose.connect(uri)
  .then(() => console.log("[SUCCESS] MongoDB connected!"))
  .catch((err) => {
    console.error("[ERROR] MongoDB connection error:", err);
    process.exit(1);
  });

app.use(express.json());

// Log when server starts
app.listen(5000, () => console.log("[INFO] Server running on port 5000"));

// Schema definition
const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  questionType: { type: String, required: true },
  questionCategory: { type: String, required: true },
  questionLevel: { type: String, required: true }
});

const Question = mongoose.model("Question", questionSchema, "questions");

// Universal request logger
app.use((req, res, next) => {
  console.log(`[REQUEST] [${new Date().toLocaleString()}] ${req.method} ${req.originalUrl}`);
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    console.log("[BODY]", JSON.stringify(req.body, null, 2));
  }
  next();
});

// GET with pagination
app.get("/api/v1/questions", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = 10;
  const skip = (page - 1) * pageSize;
  console.log(`[DEBUG] Fetching questions: page=${page}, pageSize=${pageSize}, skip=${skip}`);

  try {
    const [total, questions] = await Promise.all([
      Question.countDocuments(),
      Question.find().skip(skip).limit(pageSize)
    ]);
    console.log(`[SUCCESS] GET /api/v1/questions: Total=${total}, Returned=${questions.length}`);
    res.json({
      total,
      page,
      pageSize,
      questions
    });
  } catch (err) {
    console.error("[ERROR] Error fetching questions:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /api/v1/questions
app.delete("/api/v1/questions", async (req, res) => {
  console.log("[DEBUG] DELETE /api/v1/questions request received");
  try {
    const result = await Question.deleteMany({});
    console.log(`[SUCCESS] All questions deleted. Count: ${result.deletedCount}`);
    res.json({ message: "All questions deleted", deletedCount: result.deletedCount });
  } catch (err) {
    console.error("[ERROR] Error deleting all questions:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST (Bulk Create)
app.post("/api/v1/questions", async (req, res) => {
  const payloadType = Array.isArray(req.body) ? "Array" : "Single Object";
  console.log(`[DEBUG] POST /api/v1/questions | Payload Type: ${payloadType}`);
  try {
    let questions = Array.isArray(req.body) ? req.body : [req.body];
    console.log(`[DEBUG] Inserting ${questions.length} question(s)`);
    const saved = await Question.insertMany(questions);
    console.log(`[SUCCESS] Questions created: ${saved.length}`);
    res.status(201).json({ message: "Questions saved.", count: saved.length, questions: saved });
  } catch (err) {
    console.error("[ERROR] Bulk create error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 404 Catch-all for undefined API endpoints
app.use((req, res) => {
  console.warn(`[WARN] 404 - Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "API endpoint not found." });
});
