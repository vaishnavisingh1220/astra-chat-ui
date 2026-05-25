import { generateEmbedding } from "../services/embeddingService.js";
import { searchSimilarChunks } from "../services/chromaService.js";

export const askQuestion = async (req, res) => {
  try {

    console.log("BODY =", req.body);

    const { question, pdfNames } = req.body;

    console.log("PDF NAMES:", pdfNames);

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
      queryEmbedding,
      pdfNames?.[0]
    );

    const retrievedChunks =
      results.documents?.[0] || [];

    /* =========================
       RESPONSE
    ========================= */

    res.status(200).json({
      success: true,

      question,

      context: retrievedChunks,
    });

  } catch (error) {

    console.error("QUERY ERROR =", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};