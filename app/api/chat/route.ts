import { NextResponse } from "next/server";
import axios from "axios";
import { connectDB } from "@/lib/mongodb";
import Chat from "@/models/Chat";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { message, chatId } = await req.json();

    const lowerMsg = message.toLowerCase();

    // 🧠 Decide if web search needed
    const needsSearch =
      lowerMsg.includes("latest") ||
      lowerMsg.includes("today") ||
      lowerMsg.includes("news") ||
      lowerMsg.includes("current");

    let reply = "";

    // 🌐 FAST PATH → Tavily only
    if (needsSearch) {
      try {
        const tavilyRes = await axios.post("https://api.tavily.com/search", {
          api_key: process.env.TAVILY_API_KEY,
          query: message,
          search_depth: "advanced",
        });

        const results = tavilyRes.data.results.slice(0, 2);

        // ⚡ instant response
        reply = results
          .map((r: any, i: number) => `${i + 1}. ${r.content.slice(0, 150)}`)
          .join("\n\n");

      } catch (err) {
        console.error("Tavily error:", err);
        reply = "⚠️ Couldn't fetch latest info.";
      }

    } else {
      // 🤖 SMART PATH → Ollama

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      try {
        const ollamaRes = await fetch("http://localhost:11434/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: "phi3", // or tinyllama if needed
            prompt: `Answer briefly (2-3 lines).

Q: ${message}`,
            stream: false,
            options: {
              num_predict: 100,
            },
          }),
        });

        const data = await ollamaRes.json();
        reply = data.response;

      } catch (err: any) {
        console.error("Ollama error:", err);

        if (err.name === "AbortError") {
          reply = "⚡ Astra is thinking slower than usual... try again!";
        } else {
          reply = "⚠️ AI error occurred.";
        }
      }

      clearTimeout(timeout);
    }

    // 💾 Save to MongoDB
    const userMsg = {
      text: message,
      sender: "user",
      createdAt: new Date(),
    };

    const botMsg = {
      text: reply,
      sender: "bot",
      createdAt: new Date(),
    };

    let chat;

    if (chatId) {
      chat = await Chat.findById(chatId);

      if (!chat) throw new Error("Chat not found");

      chat.messages.push(userMsg, botMsg);
      await chat.save();
    } else {
      chat = await Chat.create({
        title: message.slice(0, 25),
        messages: [userMsg, botMsg],
      });
    }

    return NextResponse.json({
      reply,
      chatId: chat._id,
    });

  } catch (error) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      { reply: "⚠️ Something went wrong." },
      { status: 500 }
    );
  }
}