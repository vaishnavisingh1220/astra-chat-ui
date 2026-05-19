import Message from "../models/Message.js";
import Thread from "../models/Thread.js";
import mongoose from "mongoose";
import axios from "axios";

// 📩 Send Message (Authenticated + AI + Memory)
export const sendMessage = async (req, res) => {
  try {
    const { threadId, text } = req.body || {};
    const userId = req.user.userId; // ✅ from JWT

    // ✅ Validate required fields
    if (!threadId || !text) {
      return res.status(400).json({
        success: false,
        message: "threadId and text are required",
      });
    }

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(threadId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid threadId",
      });
    }

    // ✅ Check if thread exists AND belongs to user
    const thread = await Thread.findById(threadId);

    if (!thread) {
      return res.status(404).json({
        success: false,
        message: "Thread not found",
      });
    }

    if (thread.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this thread",
      });
    }

    // 🔹 1. Save USER message
    const userMessage = await Message.create({
      threadId,
      content: text,
      role: "user",
    });

    // 🔹 2. Fetch last messages for memory
    const history = await Message.find({ threadId })
      .sort({ createdAt: 1 })
      .limit(20);

    // 🔹 Format messages for AI
    const formattedHistory = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // 🔹 3. Call AI Service
    let aiReply = "AI service unavailable";

    try {
      console.log("Sending to AI:", formattedHistory);

      const aiRes = await axios.post(
  `${process.env.AI_SERVICE_URL}/api/ai/generate`,
  { messages: formattedHistory },
  { timeout: 5000 }
);
      console.log("AI RESPONSE:", aiRes.data);

      aiReply = aiRes.data?.reply || "AI service unavailable";
    } catch (err) {
       console.error("AI SERVICE ERROR FULL:", err.response?.data || err.message);
    }

    // 🔹 4. Save AI response
   let aiMessage = null;

if (typeof aiReply === "string" && aiReply.trim() !== "") {
  aiMessage = await Message.create({
    threadId,
    content: aiReply,
    role: "assistant",
  });
}

if (!aiMessage) {
  return res.status(200).json({
    success: true,
    data: {
      userMessage,
      aiMessage: {
        role: "assistant",
        content: "⚠️ AI is currently unavailable. Try again.",
      },
    },
  });
}

    // 🔹 5. Update thread timestamp
    await Thread.findByIdAndUpdate(threadId, {
      updatedAt: new Date(),
    });

    // 🔹 6. Return response
    res.status(201).json({
      success: true,
      data: {
        userMessage,
        aiMessage,
      },
    });

  } catch (err) {
    console.error("MESSAGE ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// 📜 Get Messages (Authenticated + Secure)
export const getMessages = async (req, res) => {
  try {
    const { threadId } = req.params;
    const userId = req.user.userId;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(threadId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid threadId",
      });
    }

    // ✅ Check ownership
    const thread = await Thread.findById(threadId);

    if (!thread) {
      return res.status(404).json({
        success: false,
        message: "Thread not found",
      });
    }

    if (thread.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const messages = await Message.find({ threadId }).sort({
      createdAt: 1,
    });

    res.json({
      success: true,
      data: messages,
    });

  } catch (err) {
    console.error("GET MESSAGE ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};