import express from "express";

import {
  createThread,
  getThreads,
  renameThread,
  deleteThread,
} from "../controllers/threadController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Get all threads
router.get("/", protect, getThreads);

// ✅ Create thread
router.post("/", protect, createThread);

// ✏️ Rename thread
router.patch("/:id/rename", protect, renameThread);

// 🗑️ Delete thread
router.delete("/:id", protect, deleteThread);

export default router;