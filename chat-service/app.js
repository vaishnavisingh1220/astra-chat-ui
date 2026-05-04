
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import threadRoutes from "./routes/threadRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

console.log("ENV CHECK:", process.env.MONGO_URI);

const app = express();
app.use("/messages", messageRoutes);

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ Connection Error:", err.message));

console.log("MONGO URI:", process.env.MONGO_URI);

app.use("/threads", threadRoutes);

export default app;