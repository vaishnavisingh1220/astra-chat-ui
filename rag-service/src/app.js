import express from "express";
import cors from "cors";
import multer from "multer";
import ragRoutes from "./routes/ragRoutes.js";
import queryRoutes from "./routes/queryRoutes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/api/query", queryRoutes);

app.use("/api/rag", ragRoutes);

app.use((err, req, res, next) => {
  void next;
  console.error("RAG Error:", err.message || err);
  console.error("Stack:", err.stack);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message || "File upload failed",
    });
  }

  if (err?.message === "Only PDF files are allowed") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

export default app;