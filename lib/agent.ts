type ToolResult = {
  content: string;
  sources?: { title: string; link: string }[];
};

// 🔧 TOOL: SERPAPI
async function searchTool(query: string): Promise<ToolResult> {
  const res = await fetch(
    `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${process.env.SERPAPI_KEY}`
  );

  const data = await res.json();
  const results = data.organic_results?.slice(0, 3) || [];

  return {
    content: results.map((r: any) => r.snippet).join("\n"),
    sources: results.map((r: any) => ({
      title: r.title,
      link: r.link,
    })),
  };
}

// 🤖 CALL OPENROUTER (LLAMA)
async function callLLM(messages: any[]) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Chat UI Agent",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3-8b-instruct",
      messages,
    }),
  });

  const data = await res.json();
  return data?.choices?.[0]?.message?.content;
}

// 🧠 AGENT LOOP
export async function runAgent(query: string) {
  console.log("AGENT QUERY:", query);

  // Step 1: Ask LLM what to do
  const decision = await callLLM([
    {
      role: "system",
      content: `
You are an AI agent.

Decide:
- If the query needs real-time info → respond: SEARCH:<query>
- Otherwise → respond: ANSWER:<your answer>
`,
    },
    { role: "user", content: query },
  ]);

  // Step 2: If tool needed
  if (decision.startsWith("SEARCH:")) {
    const searchQuery = decision.replace("SEARCH:", "").trim();

    console.log("🔍 Agent decided to search:", searchQuery);

    const toolResult = await searchTool(searchQuery);

    // Step 3: Final answer using tool result
    const finalAnswer = await callLLM([
      {
        role: "system",
        content: "Use the provided data to answer clearly.",
      },
      {
        role: "user",
        content: `Data:\n${toolResult.content}\n\nQuestion: ${query}`,
      },
    ]);

    return {
      text: finalAnswer,
      provider: "agent (llama + serpapi)",
      sources: toolResult.sources,
    };
  }

  // Step 4: Direct answer
  const answer = decision.replace("ANSWER:", "").trim();

  return {
    text: answer,
    provider: "agent (llama)",
    sources: [],
  };
}