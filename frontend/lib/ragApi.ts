import axios from "axios";
import API_BASE from "./api";

export const uploadPDF = async (file: File) => {
  const formData = new FormData();
  formData.append("pdf", file);

  try {
    const response = await axios.post(
      `${API_BASE}/api/rag/upload`,
      formData
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "PDF upload failed";

      throw new Error(
        typeof message === "string"
          ? message
          : JSON.stringify(message)
      );
    }

    throw error;
  }
};

export const askRAGQuestion = async (question: string) => {
  try {
    const response = await axios.post(
      `${API_BASE}/api/rag/ask`,
      { question }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Failed to query documents";

      throw new Error(
        typeof message === "string"
          ? message
          : JSON.stringify(message)
      );
    }

    throw error;
  }
};