export const chunkText = (
  text,
  chunkSize = 500,
  overlap = 100
) => {
  try {
    /* =========================
       CLEAN TEXT
    ========================= */

    const cleanedText = text
      .replace(/\s+/g, " ")
      .trim();

    /* =========================
       CHUNK STORAGE
    ========================= */

    const chunks = [];

    let start = 0;

    /* =========================
       CREATE CHUNKS
    ========================= */

    while (start < cleanedText.length) {
      const end = start + chunkSize;

      const chunk = cleanedText.slice(start, end);

      chunks.push(chunk);

      start += chunkSize - overlap;
    }

    return chunks;
  } catch (error) {
    console.error("Chunking Error:", error);

    throw error;
  }
};