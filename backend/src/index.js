import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({ path: "./../.env" }); // If index.js is in /src

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`[START] Server is running at port: ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("[FATAL] MONGO DB connection failed !!", error);
  });
