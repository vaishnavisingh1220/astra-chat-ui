import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Chat from "@/models/Chat";
import { getToken } from "next-auth/jwt";

// ✅ DELETE CHAT
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const token = await getToken({ req });

    if (!token || !token.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deleted = await Chat.findOneAndDelete({
      _id: params.id,
      userId: token.id,
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


// ✅ RENAME CHAT
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const token = await getToken({ req });

    if (!token || !token.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (!body.title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const updated = await Chat.findOneAndUpdate(
      { _id: params.id, userId: token.id },
      { title: body.title },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Chat not found or not yours" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);

  } catch (err) {
    console.error("PATCH ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


// ✅ CLEAR CHAT (remove all messages)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const token = await getToken({ req });

    if (!token || !token.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updated = await Chat.findOneAndUpdate(
      { _id: params.id, userId: token.id },
      { messages: [] },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Chat not found or not yours" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("PUT ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}