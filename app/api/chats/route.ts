import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Chat from "@/models/Chat";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = await getToken({ req });

    if (!token || !token.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = token.email;
    console.log("FETCH CHATS FOR USER:", token.email);

    const chats = await Chat.find({userId: token.email,}).sort({ updatedAt: -1 });
    console.log("DB USER IDS:", chats.map(c => c.userId));

    //  ALWAYS RETURN
    return NextResponse.json(chats);

  } catch (error) {
    console.error("GET CHATS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}