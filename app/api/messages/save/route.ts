import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import Message from "@/models/Message";

export async function POST(req: Request) {
  await connectDB();

  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { threadId, content } = await req.json();

  const message = await Message.create({
    threadId,
    userId: session.user.email,
    role: "assistant",
    content,
  });

  return NextResponse.json(message);
}