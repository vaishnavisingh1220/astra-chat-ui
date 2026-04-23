import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import Thread from "@/models/Thread";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await context.params;

  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title } = await req.json();

  if (!title || title.trim() === "") {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const updated = await Thread.findOneAndUpdate(
    {
      _id: id,
      userId: session.user.email,
    },
    { title: title.trim() },
    { new: true }
  );

  return NextResponse.json(updated);
}