import express from "express";
import { register, login, oauthExchange } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/signup", register);
router.post("/login", login);
router.post("/oauth", oauthExchange);

export default router;