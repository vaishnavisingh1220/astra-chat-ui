import express from "express";
import { generateReply } from "../controllers/aiController.js";

const router = express.Router();

router.post("/generate", generateReply);

export default router;