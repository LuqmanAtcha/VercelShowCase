import express from "express";
import answerRoutes from "./routes/answer.routes.js";

import questionRoutes from "./routes/question.routes.js";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Universal request logger
app.use((req, res, next) => {
  console.log(
    `[${new Date().toLocaleString()}] ${req.method} ${req.originalUrl}`
  );
  if (
    req.method === "POST" ||
    req.method === "PUT" ||
    req.method === "PATCH"
  ) {
    console.log("[BODY]:", JSON.stringify(req.body, null, 2));
  }
  next();
});

app.use("/api/v1/answers", answerRoutes);
app.use("/api/v1/questions", questionRoutes);

app.use((req, res) => {
  console.warn(`[WARN] 404 - Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "API endpoint not found." });
});

export default app;
