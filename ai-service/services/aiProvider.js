import axios from "axios";

export const generateAIReply = async (messages) => {
  let reply = "";

  /* =========================
     🔹 GROQ (Primary)
  ========================= */
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("Missing GROQ_API_KEY");
    }

    console.log("🚀 Calling GROQ...");

    const groqRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 5000,
      }
    );

    reply = groqRes.data.choices[0].message.content;

    return reply;

  } catch (err) {
    console.log("❌ GROQ failed:", err.response?.data || err.message);
  }

  /* =========================
     🔹 OPENROUTER (Fallback)
  ========================= */
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("Missing OPENROUTER_API_KEY");
    }

    console.log("🔁 Falling back to OpenRouter...");

    const openRes = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mixtral-8x7b-instruct",
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 5000,
      }
    );

    reply = openRes.data.choices[0].message.content;

    return reply;

  } catch (err) {
    console.log("❌ OpenRouter failed:", err.response?.data || err.message);
  }

  /* =========================
     🔹 SERP API (Last Fallback)
  ========================= */
  try {
    console.log("🌐 Falling back to SERP API...");

    const lastUserMessage =
      messages[messages.length - 1]?.content || "";

    const serpRes = await axios.get(
      "https://serpapi.com/search.json",
      {
        params: {
          q: lastUserMessage,
          api_key: process.env.SERPAPI_KEY,
        },
        timeout: 5000,
      }
    );

    reply =
      serpRes.data.organic_results?.[0]?.snippet ||
      "No results found";

    return reply;

  } catch (err) {
    console.log("❌ SerpAPI failed:", err.response?.data || err.message);
  }

  /* =========================
     🔹 FINAL FALLBACK
  ========================= */
  return "⚠️ AI service unavailable";
};