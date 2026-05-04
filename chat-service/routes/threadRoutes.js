import express from "express";
import {
  createThread,
  getThreads,
} from "../controllers/threadController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createThread);
router.get("/", protect, getThreads);

export default router;