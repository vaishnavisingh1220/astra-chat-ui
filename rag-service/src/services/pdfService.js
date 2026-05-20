import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const pdfParse = require("pdf-parse");

export const extractTextFromPDF = async (filePath) => {
  try {
    const resolvedPath = path.resolve(filePath);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(
        `PDF file does not exist at path: ${resolvedPath}`
      );
    }

    const dataBuffer = fs.readFileSync(resolvedPath);

    const pdfData = await pdfParse(dataBuffer);

    return pdfData.text;
  } catch (error) {
    console.error("PDF Extraction Error:", error);

    throw error;
  }
};