import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Chat from "@/models/Chat";

export async function GET() {
  try {
    await connectDB();

    const chats = await Chat.find().sort({ updatedAt: -1 });

    return NextResponse.json(chats);
  } catch (error) {
    console.error("GET CHATS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}