import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import threadRoutes from "./routes/threadRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/threads", threadRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("Chat Service Running 🚀");
});

const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () =>
      console.log(`Chat Service running on port ${PORT}`)
    );
  })
  .catch(err => console.log(err));