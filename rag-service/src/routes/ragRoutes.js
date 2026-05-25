import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { uploadPDF, listUploads, downloadUpload } from "../controllers/ragController.js";
import { askQuestion } from "../controllers/queryController.js";

const router = express.Router();

/* =========================
   TEST ROUTE
========================= */

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "RAG Service Working 🚀",
  });
});

/* =========================
   PDF UPLOAD
========================= */

router.post(
  "/upload",
  upload.single("pdf"),
  uploadPDF
);

/* uploads listing + download */
router.get("/uploads", listUploads);
router.get("/uploads/:name", downloadUpload);

/* =========================
   ASK QUESTION
========================= */

router.post("/ask", askQuestion);

export default router;