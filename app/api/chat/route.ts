import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Chat from "@/models/Chat";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { message, chatId } = await req.json();

    const userMsg = {
      text: message,
      sender: "user",
      createdAt: new Date(),
    };

    const botMsg = {
      text: `Astra says: "${message}" ✨`,
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
        title: message.slice(0, 20),
        messages: [userMsg, botMsg],
      });
    }

    return NextResponse.json({
      reply: botMsg.text,
      chatId: chat._id,
      messages: chat.messages,
    });

  } catch (error) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}