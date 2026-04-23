import { connectDB } from "@/lib/mongodb";
import Thread from "@/models/Thread";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: Request, context: any) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const params = await context.params;
    const threadId = params.id;

    const { text } = await req.json();

    const thread = await Thread.findOne({
      _id: threadId,
      userId: session.user.email,
    });

    if (!thread) {
      return new Response("Thread not found", { status: 404 });
    }

    // 🧠 HISTORY
    const history = thread.messages.map((m: any) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));

    history.push({ role: "user", content: text });

    // 🔎 SERP
    let sources: any[] = [];

    if (text.toLowerCase().includes("latest") || text.includes("news")) {
      try {
        const serpRes = await fetch(
          `https://serpapi.com/search.json?q=${encodeURIComponent(
            text
          )}&api_key=${process.env.SERPAPI_KEY}`
        );

        const serpData = await serpRes.json();

        sources =
          serpData.organic_results?.slice(0, 3).map((r: any) => ({
            title: r.title,
            link: r.link,
          })) || [];
      } catch {}
    }

    // 🤖 GROQ STREAM
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: history,
      stream: true,
    });

    const encoder = new TextEncoder();
    let fullText = "";

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of completion) {
          const token = chunk.choices?.[0]?.delta?.content || "";
          fullText += token;

          controller.enqueue(encoder.encode(token));
        }

        // 💾 SAVE AFTER STREAM
        await Thread.findOneAndUpdate(
          { _id: threadId, userId: session.user.email },
          {
            $push: {
              messages: [
                { text, sender: "user" },
                { text: fullText, sender: "bot", sources },
              ],
            },
          }
        );

        // 🧠 AUTO TITLE (reliable)
if (!thread.title || thread.title === "New Chat") {
  try {
    const titleRes = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `Generate a short 3-5 word title for: ${text}`,
        },
      ],
    });

    let title =
      titleRes.choices?.[0]?.message?.content || "New Chat";

    // ✂️ clean title
    title = title.replace(/["'\n]/g, "").slice(0, 40);

    await Thread.findByIdAndUpdate(threadId, { title });

  } catch (err) {
    console.log("Title generation failed");
  }
}

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Transfer-Encoding": "chunked",
      },
    });

  } catch (error) {
    console.error("AI STREAM ERROR:", error);
    return new Response("AI failed", { status: 500 });
  }
}