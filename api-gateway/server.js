import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

const app = express();

app.use(cors());

/* =========================
   AUTH SERVICE
========================= */
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://127.0.0.1:5000",
    changeOrigin: true,
    logLevel: "debug",
    onError(err, req, res) {
      console.error("AUTH PROXY ERROR:", err.message);
      res.writeHead(502, {
        "Content-Type": "text/plain",
      });
      res.end("Auth proxy error.");
    },
  })
);

/* =========================
   CHAT SERVICE
========================= */
app.use(
  "/api/chat",
  createProxyMiddleware({
    target: "http://127.0.0.1:5001",
    changeOrigin: true,
    logLevel: "debug",
    pathRewrite: {
      "^/api/chat/threads": "/api/chat/threads",
      "^/api/chat/messages": "/api/chat/messages",
      "^/threads": "/api/chat/threads",
      "^/messages": "/api/chat/messages",
    },
    onError(err, req, res) {
      console.error("CHAT PROXY ERROR:", err.message);
      res.writeHead(502, {
        "Content-Type": "text/plain",
      });
      res.end("Chat proxy error.");
    },
  })
);

/* =========================
   AI SERVICE
========================= */
app.use(
  "/api/ai",
  createProxyMiddleware({
    target: "http://127.0.0.1:5002",
    changeOrigin: true,
  })
);

app.get("/", (req, res) => {
  res.send("API Gateway Running 🚀");
});

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});