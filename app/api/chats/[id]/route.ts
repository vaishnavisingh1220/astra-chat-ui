import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Chat from "@/models/Chat";
import { getToken } from "next-auth/jwt";

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectDB();

    const token = await getToken({ req });

    if (!token || !token.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = token.id;
    const chatId = context.params.id;

    console.log("DELETE:", chatId, "USER:", userId);

    const deleted = await Chat.findOneAndDelete({
      _id: chatId,
      userId,
    });

    if (!deleted) {
      return NextResponse.json(
        { error: "Chat not found or not yours" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}