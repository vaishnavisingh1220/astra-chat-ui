import express from "express";
import cors from "cors";

import threadRoutes from "./routes/threadRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/chat/threads", threadRoutes);
app.use("/api/chat/messages", messageRoutes);

app.get("/test", (req, res) => {
  res.send("Chat Service Running 🚀");
});

export default app;