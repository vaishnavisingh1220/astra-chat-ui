import { generateEmbedding } from "../services/embeddingService.js";
import { searchSimilarChunks } from "../services/chromaService.js";
import {generateAnswer} from "../services/answerService.js";

export const askQuestion = async (req, res) => {
  try {
    console.log("BODY =", req.body);

    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    /* =========================
       GENERATE QUERY EMBEDDING
    ========================= */

    const queryEmbedding =
      await generateEmbedding(question);

    /* =========================
       SEARCH CHROMADB
    ========================= */

    const results = await searchSimilarChunks(
      queryEmbedding
    );

    const retrievedChunks = results.documents[0];

    const context = retrievedChunks.join("\n\n");

    const answer = await generateAnswer(
      question,
      context
    );

    /* =========================
       RESPONSE
    ========================= */

    res.status(200).json({
      success: true,
      question,
      results,
      answer,
      retrievedChunks,
    });
  } catch (error) {
    console.error("QUERY ERROR =", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};