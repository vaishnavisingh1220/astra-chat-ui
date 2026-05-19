import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

const app = express();

app.use(cors());

// Log incoming requests (method, url, auth presence)
app.use((req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const hasAuth = authHeader ? "with-auth" : "no-auth";
  const masked = authHeader
    ? `${authHeader.slice(0, 12)}...${authHeader.slice(-8)}`
    : "<none>";
  console.log("[API-GW]", req.method, req.url, hasAuth, "auth:", masked);
  next();
});

/* =========================
   AUTH SERVICE
========================= */
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://127.0.0.1:5000",
    changeOrigin: true,
    logLevel: "debug",
    pathRewrite: {
      "^/": "/api/auth/",
    },
    onError(err, req, res) {
      console.error("AUTH PROXY ERROR:", err.message);
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: false, message: "Auth proxy error", details: err.message }));
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
      "^/": "/api/chat/",
    },
    onError(err, req, res) {
      console.error("CHAT PROXY ERROR:", err.message);
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: false, message: "Chat proxy error", details: err.message }));
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
    pathRewrite: {
      "^/": "/api/ai/",
    },
  })
);

app.get("/", (req, res) => {
  res.send("API Gateway Running 🚀");
});

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});