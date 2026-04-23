import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import Message from "@/models/Message";
import Thread from "@/models/Thread";
import { generateReply } from "@/lib/ai";

// ✅ GET MESSAGES
export async function GET(req: Request) {
  await connectDB();

  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get("threadId");

  const messages = await Message.find({
    threadId,
    userId: session.user.email,
  }).sort({ createdAt: 1 });

  return NextResponse.json(messages);
}

// ✅ POST MESSAGE
export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { threadId, content, model } = await req.json();

    if (!threadId || !content) {
      return NextResponse.json(
        { error: "threadId and content required" },
        { status: 400 }
      );
    }

    // ✅ Save user message
    const userMessage = await Message.create({
      threadId,
      userId: session.user.email,
      role: "user",
      content,
    });

    // ✅ Auto rename thread
    const thread = await Thread.findById(threadId);
    if (thread && thread.title === "New Chat") {
      await Thread.findByIdAndUpdate(threadId, {
        title: content.substring(0, 30),
      });
    }

    // ✅ Generate AI response
    const { text, provider, sources } = await generateReply(content, model);

    // ✅ Update thread timestamp
    await Thread.findByIdAndUpdate(threadId, {
      updatedAt: new Date(),
    });

    return NextResponse.json({
      userMessage,
      reply: text,
      provider,
      sources,
    });

  } catch (err) {
    console.error("API ERROR:", err);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}