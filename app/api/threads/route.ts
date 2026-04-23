import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import Thread from "@/models/Thread";

// ✅ CREATE NEW THREAD
export async function POST() {
  await connectDB();

  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const thread = await Thread.create({
    userId: session.user.email,
    title: "New Chat",
  });

  return NextResponse.json(thread);
}

// ✅ GET ALL THREADS (for sidebar)
export async function GET() {
  await connectDB();

  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const threads = await Thread.find({
    userId: session.user.email,
  }).sort({ updatedAt: -1 });

  return NextResponse.json(threads);
}