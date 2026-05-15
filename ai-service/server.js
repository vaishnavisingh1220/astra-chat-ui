import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/test", (req, res) => {
  res.send("AI Service Running 🚀");
});

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
      if (!process.env.GROQ_API_KEY) {
        throw new Error("Missing GROQ_API_KEY");
      }

      console.log("Calling GROQ...");

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
    } catch (err) {
      console.log("❌ Groq failed:", err.response?.data || err.message);

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
      } catch (err2) {
        console.log("❌ OpenRouter failed:", err2.response?.data || err2.message);
        console.log("🌐 Falling back to SERP API...");

        const lastUserMessage = messages[messages.length - 1].content;

        try {
          const serpRes = await axios.get("https://serpapi.com/search.json", {
            params: {
              q: lastUserMessage,
              api_key: process.env.SERPAPI_KEY,
            },
            timeout: 5000,
          });

          reply =
            serpRes.data.organic_results?.[0]?.snippet ||
            "No results found";
        } catch (err3) {
          console.log("❌ SerpAPI failed:", err3.response?.data || err3.message);
          reply = "AI service unavailable";
        }
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