import express from "express";
import cors from "cors";
import ragRoutes from "./routes/ragRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/rag", ragRoutes);

export default app;
