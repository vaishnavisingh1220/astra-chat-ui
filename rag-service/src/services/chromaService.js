// In-memory vector store
const collections = {};

const createCollection = (name) => {
  if (!collections[name]) {
    collections[name] = {
      documents: [],
      embeddings: [],
      metadatas: [],
      ids: [],
    };
  }
  return collections[name];
};

const COLLECTION_NAME = "pdf_documents";

export const getCollection = async () => {
  try {
    const collection = createCollection(COLLECTION_NAME);
    return collection;
  } catch (error) {
    console.error("Collection Error:", error.message);
    throw error;
  }
};

export const storeEmbeddings = async (
  chunks,
  embeddings,
  fileName
) => {
  try {
    const collection = await getCollection();

    const ids = chunks.map((_, index) => {
      return `${fileName}-${index}-${Date.now()}`;
    });

    const metadatas = chunks.map(() => ({
      source: fileName,
    }));

    collection.documents.push(...chunks);
    collection.embeddings.push(...embeddings);
    collection.metadatas.push(...metadatas);
    collection.ids.push(...ids);

    console.log("✅ Embeddings Stored in Memory");

    return true;
  } catch (error) {
    console.error("❌ Store Embedding Error:", error.message);
    throw error;
  }
};

// Simple cosine similarity calculation
const cosineSimilarity = (a, b) => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
};

export const searchSimilarChunks = async (
  queryEmbedding,
  pdfName,
  topK = 5
) => {
  try {
    const collection = await getCollection();

    if (collection.embeddings.length === 0) {
      return {
        documents: [[]],
        metadatas: [[]],
        distances: [[]],
      };
    }

    // ✅ Filter chunks from selected PDF
    const filteredIndexes =
      collection.metadatas
        .map((meta, idx) => ({
          meta,
          idx,
        }))
        .filter(
          (item) =>
            item.meta.source === pdfName
        );

    // ✅ Similarity calculation
    const similarities =
      filteredIndexes.map((item) => ({
        index: item.idx,

        similarity: cosineSimilarity(
          queryEmbedding,
          collection.embeddings[item.idx]
        ),
      }));

    // ✅ Sort best matches
    const topResults = similarities
      .sort(
        (a, b) =>
          b.similarity - a.similarity
      )
      .slice(0, topK);

    const resultDocuments =
      topResults.map(
        (r) =>
          collection.documents[r.index]
      );

    const resultMetadatas =
      topResults.map(
        (r) =>
          collection.metadatas[r.index]
      );

    const resultDistances =
      topResults.map(
        (r) => 1 - r.similarity
      );

    return {
      documents: [resultDocuments],
      metadatas: [resultMetadatas],
      distances: [resultDistances],
    };

  } catch (error) {
    console.error(
      "❌ Retrieval Error:",
      error.message
    );

    throw error;
  }
};