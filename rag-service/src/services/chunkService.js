export const chunkText = (
  text,
  chunkSize = 800,
  overlap = 150
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
       CREATE SEMANTIC CHUNKS
    ========================= */

    while (start < cleanedText.length) {

      let end = start + chunkSize;

      // ✅ avoid cutting sentences badly
      if (end < cleanedText.length) {

        const lastPeriod =
          cleanedText.lastIndexOf(".", end);

        const lastQuestion =
          cleanedText.lastIndexOf("?", end);

        const lastExclamation =
          cleanedText.lastIndexOf("!", end);

        const bestEnd = Math.max(
          lastPeriod,
          lastQuestion,
          lastExclamation
        );

        // ✅ only adjust if valid
        if (bestEnd > start) {
          end = bestEnd + 1;
        }
      }

      const chunk = cleanedText
        .slice(start, end)
        .trim();

      // ✅ ignore tiny junk chunks
      if (chunk.length > 100) {
        chunks.push(chunk);
      }

      // ✅ overlap preserves context continuity
      start += chunkSize - overlap;
    }

    return chunks;

  } catch (error) {

    console.error("Chunking Error:", error);

    throw error;
  }
};