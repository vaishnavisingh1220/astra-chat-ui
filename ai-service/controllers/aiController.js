import { generateAIReply } from "../services/aiProvider.js";

export const generateReply = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: "Messages array is required",
      });
    }

    const reply = await generateAIReply(messages);

    res.json({
      success: true,
      reply,
    });

  } catch (err) {
    console.error("AI CONTROLLER ERROR:", err.message);

    res.status(500).json({
      success: false,
      message: "AI generation failed",
    });
  }
};