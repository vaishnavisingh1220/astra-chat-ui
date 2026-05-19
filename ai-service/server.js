import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/ai", aiRoutes);

app.get("/test", (req, res) => {
  res.send("AI Service Running 🚀");
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () =>
  console.log(`AI Service running on port ${PORT}`)
);