import dotenv from "dotenv";
import * as appModule from "./app.js";

dotenv.config();

const app = appModule.default || appModule;

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => {
  console.log(`RAG Service running on port ${PORT}`);
});