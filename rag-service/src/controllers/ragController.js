import { extractTextFromPDF } from "../services/pdfService.js";

export const uploadPDF = async (req, res) => {
  try {
    console.log("REQ.FILE =", req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const extractedText = await extractTextFromPDF(
      req.file.path
    );

    res.status(200).json({
      success: true,
      message: "PDF processed successfully",
      extractedText,
    });
  } catch (error) {
    console.error("CONTROLLER ERROR =", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};