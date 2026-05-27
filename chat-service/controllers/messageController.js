import Message from "../models/Message.js";
import Thread from "../models/Thread.js";
import mongoose from "mongoose";

// 📩 Send Message (Authenticated + Agentic AI Streaming)
export const sendMessage = async (req, res) => {
  try {

    const { threadId, text, pdfNames } =
      req.body || {};

    console.log("REQ BODY:", req.body);

    const userId = req.user.userId;

    // ✅ Stream headers
    res.setHeader(
      "Content-Type",
      "text/plain"
    );

    res.setHeader(
      "Transfer-Encoding",
      "chunked"
    );

    // ✅ Validate required fields
    if (!threadId || !text) {
      res.write(
        "threadId and text are required"
      );

      res.end();

      return;
    }

    // ✅ Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        threadId
      )
    ) {
      res.write("Invalid threadId");

      res.end();

      return;
    }

    // ✅ Check thread ownership
    const thread =
      await Thread.findById(threadId);

    if (!thread) {
      res.write("Thread not found");

      res.end();

      return;
    }

    if (
      thread.userId.toString() !==
      userId.toString()
    ) {
      res.write(
        "Not authorized to access this thread"
      );

      res.end();

      return;
    }

    // 🔹 1. Save USER message
    const userMessage =
      await Message.create({
        threadId,
        content: text,
        role: "user",
      });

    // 🧠 Auto-generate title
    if (
      !thread.title ||
      thread.title === "New Chat"
    ) {
      thread.title = text
        .split(" ")
        .slice(0, 5)
        .join(" ");

      await thread.save();
    }

    // 🔹 2. Fetch conversation history
    const history =
      await Message.find({
        threadId,
      })
        .sort({ createdAt: -1 })
        .limit(15);

    const orderedHistory =
      history.reverse();

    // 🔹 Format history
    const formattedHistory =
      orderedHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    console.log(
      "MEMORY LENGTH:",
      formattedHistory.length
    );

    // 🔹 3. Call AGNO STREAM SERVICE
    let aiReply = "";

    try {

      console.log(
        "Sending to AGNO Agent..."
      );

      const aiRes = await fetch(
        `${process.env.AGNO_SERVICE_URL}/chat-stream`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            message: text,
            pdfNames,
            history: formattedHistory,
          }),
        }
      );

      const reader =
        aiRes.body.getReader();

      const decoder =
        new TextDecoder();

      while (true) {

        const { done, value } =
          await reader.read();

        if (done) break;

        const chunk =
          decoder.decode(value);

        aiReply += chunk;

        // 🔥 Stream chunk to frontend
        res.write(chunk);
      }

    } catch (err) {

      console.error(
        "AGNO SERVICE ERROR:",
        err.message
      );

      res.write(
        "⚠️ AI is currently unavailable."
      );

      res.end();

      return;
    }

    // 🔹 4. Save AI response
    if (
      typeof aiReply === "string" &&
      aiReply.trim() !== ""
    ) {

      await Message.create({
        threadId,
        content: aiReply,
        role: "assistant",
      });
    }

    // 🔹 5. Update thread timestamp
    await Thread.findByIdAndUpdate(
      threadId,
      {
        updatedAt: new Date(),
      }
    );

    // 🔹 6. End stream
    res.end();

  } catch (err) {

    console.error(
      "MESSAGE ERROR:",
      err
    );

    res.write(
      "⚠️ Internal server error."
    );

    res.end();
  }
};


// 📜 Get Messages
export const getMessages = async (
  req,
  res
) => {
  try {

    const { threadId } = req.params;

    const userId = req.user.userId;

    // ✅ Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        threadId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid threadId",
      });
    }

    // ✅ Check ownership
    const thread =
      await Thread.findById(threadId);

    if (!thread) {
      return res.status(404).json({
        success: false,
        message: "Thread not found",
      });
    }

    if (
      thread.userId.toString() !==
      userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // 🔹 Fetch messages
    const messages =
      await Message.find({
        threadId,
      }).sort({
        createdAt: 1,
      });

    res.json({
      success: true,
      data: messages,
    });

  } catch (err) {

    console.error(
      "GET MESSAGE ERROR:",
      err
    );

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};