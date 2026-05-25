import { getCollection } from "../services/chromaService.js";

const testChroma = async () => {
  try {
    const collection = await getCollection();

    console.log("✅ Chroma Connected");
    console.log("Collection:", collection.name);
  } catch (error) {
    console.error("❌ Chroma Test Failed:", error.message);
  }
};

testChroma();