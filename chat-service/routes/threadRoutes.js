import express from "express";

import {
  createThread,
  getThreads,
} from "../controllers/threadController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Get all threads
router.get("/", protect, getThreads);

// ✅ Create thread
router.post("/", protect, createThread);

export default router;