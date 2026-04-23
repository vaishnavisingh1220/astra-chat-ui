import { NextResponse } from "next/server";
import axios from "axios";
import Groq from "groq-sdk";
import { connectDB } from "@/lib/mongodb";
import Chat from "@/models/Thread";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // ✅ SAFE BODY PARSE
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { message, chatId } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // 🔐 AUTH (FIXED + RELIABLE)
    const token = await getToken({ req });

    if (!token || !token.id) {
      console.log("❌ NO TOKEN");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = token.email as string;
    console.log("SAVE USER:", token.email);

    // 🔍 SEARCH DETECTION
    const lowerMsg = message.toLowerCase();

    const needsSearch =
      lowerMsg.includes("latest") ||
      lowerMsg.includes("news") ||
      lowerMsg.includes("today") ||
      lowerMsg.includes("current");

    let context = "";
    let sources: { title: string; link: string }[] = [];

    // 🌐 SERP API (SAFE)
    if (needsSearch && process.env.SERPAPI_KEY) {
      try {
        const serpRes = await axios.get(
          "https://serpapi.com/search.json",
          {
            params: {
              q: message,
              api_key: process.env.SERPAPI_KEY,
            },
          }
        );

        const results =
          serpRes.data?.organic_results?.slice(0, 3) || [];

        context = results.map((r: any) => r.snippet).join("\n");

        sources = results.map((r: any) => ({
          title: r.title,
          link: r.link,
        }));
      } catch (err) {
        console.error("❌ SerpAPI error:", err);
      }
    }

    // 🤖 GROQ LLM (SAFE)
    let reply = "⚠️ No response";

    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are Astra, a smart AI assistant.",
          },
          {
            role: "user",
            content: `${message}\n\n${
              context ? `Web results:\n${context}` : ""
            }`,
          },
        ],
      });

      reply =
        completion.choices?.[0]?.message?.content ||
        "⚠️ No response";
    } catch (err) {
      console.error("❌ Groq error:", err);
      reply = "⚠️ AI service unavailable.";
    }

    // 💬 MESSAGES
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

    // 🔄 UPDATE EXISTING CHAT
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, userId });

      if (!chat) {
        return NextResponse.json(
          { error: "Chat not found" },
          { status: 404 }
        );
      }

      chat.messages.push(userMsg, botMsg);
      chat.updatedAt = new Date();

      await chat.save();
    }

    // 🆕 CREATE NEW CHAT
    else {
      chat = await Chat.create({
        userId,
        title: message.slice(0, 30),
        messages: [userMsg, botMsg],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      reply,
      chatId: chat._id,
      sources,
    });

  } catch (error) {
    console.error("❌ API ERROR:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}