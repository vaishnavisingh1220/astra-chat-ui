import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Simulated response (replace with OpenAI later)
    const reply = `Astra says: "${message}" sounds interesting ✨`;

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}