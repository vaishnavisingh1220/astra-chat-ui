import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

const app = express();

app.use(cors());


// 🔐 Auth Service
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE,
    changeOrigin: true,
    pathRewrite: (path) => {
        return "/api/auth" + path.replace("/api/auth", "");
    },
    proxyTimeout: 10000,
    timeout: 10000,
  })
);

// 💬 Chat Service
app.use(
  "/api/chat",
  createProxyMiddleware({
    target: process.env.CHAT_SERVICE,
    changeOrigin: true,
    pathRewrite: (path) => path,
    proxyTimeout: 10000,
    timeout: 10000,
  })
);

// 🤖 AI Service
app.use(
  "/api/ai",
  createProxyMiddleware({
    target: process.env.AI_SERVICE,
    changeOrigin: true,
    pathRewrite: (path) => path,
    proxyTimeout: 10000,
    timeout: 10000,
  })
);

app.get("/", (req, res) => {
  res.send("API Gateway Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});