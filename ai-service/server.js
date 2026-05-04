import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   🔹 GROQ (Primary)
========================= */
const callGroq = async (message) => {
  const res = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: "You are a helpful AI assistant." },
        { role: "user", content: message },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data.choices[0].message.content;
};

/* =========================
   🔹 OPENROUTER (Fallback)
========================= */
const callOpenRouter = async (message) => {
  const res = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "mistralai/mixtral-8x7b-instruct",
      messages: [
        { role: "system", content: "You are a helpful AI assistant." },
        { role: "user", content: message },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data.choices[0].message.content;
};

/* =========================
   🔹 SERP API (Web Search)
========================= */
const callSerpAPI = async (query) => {
  const res = await axios.get("https://serpapi.com/search.json", {
    params: {
      q: query,
      api_key: process.env.SERPAPI_KEY,
    },
  });

  return res.data.organic_results?.[0]?.snippet || "No results found";
};

/* =========================
   🎯 MAIN ROUTE
========================= */
app.post("/generate", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: "Messages array is required",
      });
    }

    let reply = "";

    try {
      console.log("Calling GROQ...");

      const groqRes = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model:  "llama-3.1-8b-instant",
          messages,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      reply = groqRes.data.choices[0].message.content;

    } catch (err) {
      console.log("❌ Groq failed:", err.response?.data || err.message);

      try {
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
          }
        );

        reply = openRes.data.choices[0].message.content;

      } catch (err2) {
        console.log("❌ OpenRouter failed:", err2.response?.data || err2.message);
        console.log("🌐 Falling back to SERP API...");

        const lastUserMessage = messages[messages.length - 1].content;

        const serpRes = await axios.get(
          "https://serpapi.com/search.json",
          {
            params: {
              q: lastUserMessage,
              api_key: process.env.SERPAPI_KEY,
            },
          }
        );

        reply =
          serpRes.data.organic_results?.[0]?.snippet ||
          "No results found";
      }
    }

    // ✅ RETURN REAL REPLY
    res.json({
      success: true,
      reply,
    });

  } catch (err) {
    console.error("AI SERVICE ERROR:", err.message);

    res.status(500).json({
      success: false,
      message: "AI generation failed",
    });
  }
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () =>
  console.log(`AI Service running on port ${PORT}`)
);