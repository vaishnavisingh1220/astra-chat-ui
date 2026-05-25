import { extractTextFromPDF } from "../services/pdfService.js";
import fs from "fs";
import path from "path";
import { chunkText } from "../services/chunkService.js";
import { generateEmbedding } from "../services/embeddingService.js";
import { storeEmbeddings } from "../services/chromaService.js";

export const uploadPDF = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    console.log("UPLOAD RECEIVED:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    });

    /* =========================
       EXTRACT TEXT
    ========================= */

    let extractedText;

    try {
      extractedText = await extractTextFromPDF(req.file.path);
    } catch (err) {
      console.error("PDF PARSE ERROR =", err.message || err);

      return res.status(200).json({
        success: true,
        message: `File uploaded but PDF parsing failed: ${err.message || "parse error"}`,
        parseError: err.message || "parse error",
        uploadedFile: {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
        },
      });
    }

    /* =========================
       CHUNK TEXT
    ========================= */

    let chunks;
    try {
      chunks = chunkText(extractedText);
    } catch (err) {
      console.error("CHUNKING ERROR =", err.message);
      return res.status(500).json({
        success: false,
        message: "Text chunking failed",
        error: err.message,
      });
    }

    /* =========================
       GENERATE EMBEDDINGS
    ========================= */

    const embeddedChunks = [];

    try {
      for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk);
        embeddedChunks.push({
          text: chunk,
          embedding,
        });
      }
    } catch (err) {
      console.error("EMBEDDING ERROR =", err.message);
      return res.status(500).json({
        success: false,
        message: "Embedding generation failed",
        error: err.message,
      });
    }

    /* =========================
       STORE IN CHROMADB
    ========================= */

    try {
      const embeddings = embeddedChunks.map(
        (item) => item.embedding
      );

      await storeEmbeddings(
        chunks,
        embeddings,
        req.file.originalname
      );
    } catch (err) {
      console.error("CHROMA STORE ERROR =", err.message);
      return res.status(500).json({
        success: false,
        message: "Failed to store embeddings",
        error: err.message,
      });
    }

    /* =========================
       RESPONSE
    ========================= */

    res.status(200).json({
      success: true,
      message: "Embeddings stored successfully",
      totalChunks: embeddedChunks.length,
      sample: embeddedChunks[0],
    });
  } catch (error) {
    console.error("CONTROLLER ERROR =", error.message);
    console.error("Stack:", error.stack);

    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const listUploads = async (req, res) => {
  try {
    const uploadDir = path.join(process.cwd(), "src", "uploads");

    if (!fs.existsSync(uploadDir)) {
      return res.status(200).json({ files: [] });
    }

    const files = fs.readdirSync(uploadDir).map((name) => {
      const abs = path.join(uploadDir, name);
      const stat = fs.statSync(abs);

      return {
        name,
        size: stat.size,
        modifiedAt: stat.mtime,
      };
    });

    return res.status(200).json({ files });
  } catch (err) {
    console.error("LIST UPLOADS ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const downloadUpload = async (req, res) => {
  try {
    const { name } = req.params;
    const filePath = path.join(process.cwd(), "src", "uploads", name);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    return res.sendFile(filePath);
  } catch (err) {
    console.error("DOWNLOAD UPLOAD ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};