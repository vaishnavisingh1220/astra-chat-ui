function needsSearch(query: string) {
  const keywords = ["latest", "news", "today", "current", "price", "weather"];
  return keywords.some((k) => query.toLowerCase().includes(k));
}

async function fetchSerpData(query: string) {
  const res = await fetch(
    `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${process.env.SERPAPI_KEY}`
  );

  const data = await res.json();

  const results = data.organic_results?.slice(0, 3) || [];

  return {
    snippets: results.map((r: any) => r.snippet).join("\n"),
    sources: results.map((r: any) => ({
      title: r.title,
      link: r.link,
    })),
  };
}

export async function generateReply(query: string) {
  console.log("QUERY:", query);

  try {
    let context = query;
    let sources: any[] = [];
    let provider = "llama (openrouter)";

    // 🌐 USE SERPAPI FOR REAL-TIME
    if (needsSearch(query)) {
      console.log("Using SERPAPI");

      const { snippets, sources: src } = await fetchSerpData(query);

      context = `Use this real-time data to answer:\n\n${snippets}\n\nQuestion: ${query}`;
      sources = src;
      provider = "llama + serpapi";
    }

    // 🤖 OPENROUTER (LLAMA)
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Chat UI Project",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          {
            role: "user",
            content: context,
          },
        ],
      }),
    });

    const data = await res.json();

    console.log("OPENROUTER RESPONSE:", data);

    const text = data?.choices?.[0]?.message?.content;

    if (!text) throw new Error("No response");

    return {
      text,
      provider,
      sources,
    };

  } catch (err) {
    console.error("❌ ERROR:", err);

    return {
      text: "⚠️ Failed to fetch real-time data",
      provider: "error",
      sources: [],
    };
  }
}