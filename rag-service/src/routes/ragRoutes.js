import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { uploadPDF } from "../controllers/ragController.js";

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

export default router;