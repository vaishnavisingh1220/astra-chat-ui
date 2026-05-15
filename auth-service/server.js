import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

app.use("/api/auth", authRoutes);

app.get("/test", (req, res) => {
  res.send("Auth Service Running 🚀");
});

console.log(process.env.PORT);
console.log(process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(process.env.PORT, () =>
      console.log(`Auth Service running on port ${process.env.PORT}`)
    );
  })
  .catch(err => console.log(err));