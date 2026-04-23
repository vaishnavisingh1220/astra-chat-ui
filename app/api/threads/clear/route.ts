import { NextResponse } from "next/server";
import Thread from "@/models/Thread";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";

export async function DELETE() {
  await connectDB();

  const session = await getServerSession();

  await Thread.deleteMany({
    userId: session.user.email,
  });

  return NextResponse.json({ success: true });
}